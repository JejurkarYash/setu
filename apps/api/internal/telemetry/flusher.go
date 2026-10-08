package telemetry

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
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
	db     *database.Database
	logger *slog.Logger
	ch     chan BatcherEvent
	wg     sync.WaitGroup
}

func NewBatcher(db *database.Database, logger *slog.Logger, bufferSize int, workerPool int) *Batcher {

	b := &Batcher{
		db:     db,
		logger: logger,
		ch:     make(chan BatcherEvent, bufferSize),
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

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		var projectUUID pgtype.UUID
		if err := projectUUID.Scan(event.ProjectID); err != nil {
			b.logger.Error("failed to parse projectID as UUID", slog.Any("error", err))
			cancel()
			continue // dont hang down here -> other should continue
		}

		// Audit logs entry
		_, err := b.db.Queries.InsertUsageLog(ctx, dbgen.InsertUsageLogParams{
			ProjectID:        projectUUID,
			Model:            event.Model,
			PromptTokens:     int32(event.InputToken),
			CompletionTokens: int32(event.OutputToken),
			StatusCode:       int32(event.StatusCode),
			CostUsd:          float64(event.TotalCost),
		})
		if err != nil {
			b.logger.Error("failed to insert logs", slog.Any("err", err))
		}

		// update spend into db
		_, err = b.db.Queries.UpdateSpendDB(ctx, dbgen.UpdateSpendDBParams{
			Spend: event.TotalCost,
			ID:    event.ProjectID,
		})

		if err != nil {
			b.logger.Error("failed to update spend into DB", slog.Any("projectID", event.ProjectID), slog.Any("err", err))

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
