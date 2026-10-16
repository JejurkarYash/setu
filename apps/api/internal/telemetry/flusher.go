package telemetry

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/notifier"
	"github.com/jackc/pgx/v5"
	"github.com/shopspring/decimal"
)

type BatcherEvent struct {
	ProjectID   string
	Model       string
	InputToken  int
	OutputToken int
	TotalCost   decimal.Decimal
	StatusCode  int
}

type Batcher struct {
	db            *database.Database
	logger        *slog.Logger
	ch            chan BatcherEvent
	wg            sync.WaitGroup
	SlackNotifier *notifier.SlackNotifier
	encryptor     *utils.Encryptor
}

const (
	batchSize     = 500                    // Flush when slice hits 500 items
	flushInterval = 100 * time.Millisecond // Or flush every 100ms
)

func NewBatcher(db *database.Database, logger *slog.Logger, bufferSize int, workerPool int, slackNotifier *notifier.SlackNotifier, encryptor *utils.Encryptor) *Batcher {

	b := &Batcher{
		db:            db,
		logger:        logger,
		ch:            make(chan BatcherEvent, bufferSize),
		SlackNotifier: slackNotifier,
		encryptor:     encryptor,
	}

	// run worker's in background ( spawn into background )
	for i := 0; i < workerPool; i++ {
		b.wg.Add(1) // added waitgroup
		go b.startWorker()
	}

	return b

}

func (b *Batcher) startWorker() {
	defer b.wg.Done()

	events := make([]BatcherEvent, 0, batchSize)
	ticker := time.NewTicker(flushInterval)
	defer ticker.Stop()

	for {
		select {
		case event, ok := <-b.ch:
			if !ok {
				// Channel closed: flush remaining and exit
				if len(events) > 0 {
					b.flushBatch(events)
				}
				return
			}

			events = append(events, event)
			if len(events) >= batchSize {
				b.flushBatch(events)
				events = make([]BatcherEvent, 0, batchSize)
			}

		case <-ticker.C:
			if len(events) > 0 {
				b.flushBatch(events)
				events = make([]BatcherEvent, 0, batchSize)
			}
		}
	}
}

func (b *Batcher) flushBatch(events []BatcherEvent) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Bulk insert usage logs using pgx.CopyFrom (high performance)
	rows := make([][]any, len(events))
	projectSpends := make(map[string]decimal.Decimal)

	for i, e := range events {
		rows[i] = []any{
			e.ProjectID,
			e.Model,
			int32(e.InputToken),
			int32(e.OutputToken),
			int32(e.StatusCode),
			e.TotalCost,
			time.Now().UTC(),
		}

		// Aggregate spend per project locally in memory
		projectSpends[e.ProjectID] = projectSpends[e.ProjectID].Add(e.TotalCost)
	}

	_, err := b.db.Pool.CopyFrom(
		ctx,
		pgx.Identifier{"usage_logs"},
		[]string{"project_id", "model", "prompt_tokens", "completion_tokens", "status_code", "cost_usd", "created_at"},
		pgx.CopyFromRows(rows),
	)
	if err != nil {
		b.logger.Error("failed to bulk copy usage logs", "err", err)
	}

	// 2. Perform aggregated spend updates per project
	for projectID, addedSpend := range projectSpends {
		b.processProjectSpendAndAlert(ctx, projectID, addedSpend)
	}
}

func (b *Batcher) processProjectSpendAndAlert(ctx context.Context, projectID string, addedSpend decimal.Decimal) {
	// Atomic update to project spend
	updatedProject, err := b.db.Queries.UpdateSpendDB(ctx, dbgen.UpdateSpendDBParams{
		Spend: addedSpend,
		ID:    projectID,
	})
	if err != nil {
		b.logger.Error("failed to update aggregated spend", "project_id", projectID, "err", err)
		return
	}

	// Offload Slack alert checking asynchronously so it doesn't block telemetry ingestion
	go b.checkAndTriggerAlert(projectID, decimal.NewFromFloat(updatedProject.Spend), decimal.NewFromFloat(updatedProject.MonthlyBudget))
}

func (b *Batcher) checkAndTriggerAlert(projectID string, currentSpend, monthlyBudget decimal.Decimal) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if monthlyBudget.IsZero() || monthlyBudget.IsNegative() {
		return
	}

	alertConfig, err := b.db.Queries.GetAlertConfigByProjectID(ctx, projectID)
	if err != nil {
		return
	}

	spendInPct := int32(currentSpend.Div(monthlyBudget).Mul(decimal.NewFromInt(100)).IntPart())

	if spendInPct >= alertConfig.TriggerThresholdPct && alertConfig.NotifySlack {
		// Run Slack notification

		lastNotified := alertConfig.LastNotifiedAt

		now := time.Now().UTC()
		monthStart := time.Date(
			now.Year(),
			now.Month(),
			1,
			0, 0, 0, 0,
			time.UTC,
		)

		alreadyNotifiedThisMonth := lastNotified.Valid &&
			!lastNotified.Time.Before(monthStart)

		if !alreadyNotifiedThisMonth && alertConfig.NotifySlack { // -> send slack alert

			// decrypt the webhook url first
			webhookURL, err := b.encryptor.Decrypt(alertConfig.SlackWebhookUrlEncrypted, alertConfig.SlackWebhookNonce)
			if err != nil {
				b.logger.Error("failed to decrypt webhook url ", slog.Any("err", err))
				cancel()
				return
			}

			// fetch project info
			updatedProject, err := b.db.Queries.GetProjectByID(ctx, alertConfig.ProjectID)
			if err != nil {
				b.logger.Error("failed to load project info ", slog.Any("err", err))
				cancel()
				return
			}

			err = b.SlackNotifier.Send(ctx, webhookURL, updatedProject.Name, updatedProject.Spend, updatedProject.MonthlyBudget, alertConfig.TriggerThresholdPct)
			if err != nil {
				b.logger.Error("failed to send slack alert")
				cancel()
				return
			}

			// update the alert config
			err = b.db.Queries.UpdateLastNotifiedAt(ctx, projectID)
			if err != nil {
				b.logger.Error("failed to update status of last notifier at", slog.Any("err", err))
				cancel()
				return
			}

		}
	}
}

// pushing events into channel
func (b *Batcher) Enqueue(event BatcherEvent) {
	select {
	case b.ch <- event:
	default:
		b.logger.Warn("usage event buffer full, dropping telemetry log", slog.String("project_id", event.ProjectID))
	}
}

// closing channel
func (b *Batcher) Close() {
	close(b.ch)
	b.wg.Wait()
}
