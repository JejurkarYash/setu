package telemetry

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/notifier"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type BatcherEvent struct {
	ProjectID   string
	Model       string
	InputToken  int
	OutputToken int
	TotalCost   float64
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

// worker
func (b *Batcher) startWorker() {
	defer b.wg.Done()

	for event := range b.ch { // -> listen to channel and pick the events one by one

		// attaching some context to logger
		logger := b.logger.With(
			slog.String("project_id", event.ProjectID),
		)

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		var projectUUID pgtype.UUID
		if err := projectUUID.Scan(event.ProjectID); err != nil {
			logger.Error("failed to parse projectID as UUID", slog.Any("error", err))
			cancel()
			continue // dont hang down here -> other should continue
		}

		// Audit logs entry
		_, err := b.db.Queries.InsertUsageLog(ctx, dbgen.InsertUsageLogParams{
			ProjectID:        event.ProjectID,
			Model:            event.Model,
			PromptTokens:     int32(event.InputToken),
			CompletionTokens: int32(event.OutputToken),
			StatusCode:       int32(event.StatusCode),
			CostUsd:          float64(event.TotalCost),
		})
		if err != nil {
			logger.Error("failed to insert logs", slog.Any("err", err))
		}

		// update spend into db
		updatedProject, err := b.db.Queries.UpdateSpendDB(ctx, dbgen.UpdateSpendDBParams{
			Spend: event.TotalCost,
			ID:    event.ProjectID,
		})

		if err != nil {
			logger.Error("failed to update spend into DB", slog.Any("projectID", event.ProjectID), slog.Any("err", err))

		}

		// Sending Alerts
		// load alert config for project
		alertConfig, err := b.db.Queries.GetAlertConfigByProjectID(ctx, event.ProjectID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				cancel()
				continue
			}

			logger.Error("failed to load alert config", slog.Any("err", err))

			cancel()
			continue
		}

		// calculate percentage
		if updatedProject.MonthlyBudget <= 0 {
			cancel()
			continue // avoid the divid by zero error
		}

		spendInPercentage := int32((updatedProject.Spend / updatedProject.MonthlyBudget) * 100)

		if spendInPercentage >= alertConfig.TriggerThresholdPct { // threshold exceeded move forward

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
					logger.Error("failed to decrypt webhook url ", slog.Any("err", err))

					cancel()
					continue
				}
				// fetch project info
				project, err := b.db.Queries.GetProjectByID(ctx, alertConfig.ProjectID)
				if err != nil {
					logger.Error("failed to load project info ", slog.Any("err", err))

					cancel()
					continue
				}

				err = b.SlackNotifier.Send(ctx, webhookURL, project.Name, updatedProject.Spend, updatedProject.MonthlyBudget, alertConfig.TriggerThresholdPct)
				if err != nil {
					logger.Error("failed to send slack alert")

					cancel()
					continue
				}

				// update the alert config
				err = b.db.Queries.UpdateLastNotifiedAt(ctx, event.ProjectID)
				if err != nil {
					logger.Error("failed to update status of last notifier at", slog.Any("err", err))

					cancel()
					continue
				}

			}

		}

		// cancel context
		cancel()
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
