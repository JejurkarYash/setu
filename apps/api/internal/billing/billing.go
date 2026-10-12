package billing

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/shopspring/decimal"
)

type BillingConfig struct {
	db     *database.Database
	rdb    *redis.Client
	logger *slog.Logger
}

// Rate holds per-token cost, expressed as USD per token (i.e. USD-per-million / 1,000,000).
type Rate struct {
	InputRate  float64
	OutputRate float64
}

func NewBillingConfig(db *database.Database, rdb *redis.Client, logger *slog.Logger) *BillingConfig {
	return &BillingConfig{
		db:     db,
		rdb:    rdb,
		logger: logger,
	}
}

func (b *BillingConfig) CalculateCost(ctx context.Context, provider, model string, inputToken, outputToken int) (decimal.Decimal, error) {
	if inputToken < 0 || outputToken < 0 {
		return decimal.Zero, fmt.Errorf("token count cannot be negative")
	}

	modelRates, found, err := b.rdb.GetModelData(ctx, model)
	if err != nil {
		b.logger.Warn("failed to get model rates from redis, falling back to db", slog.Any("err", err))
		found = false
	}

	// Cache HIT
	if found {
		inputCost := modelRates.InputCost.Mul(decimal.NewFromInt(int64(inputToken)))
		outputCost := modelRates.OutputCost.Mul(decimal.NewFromInt(int64(outputToken)))
		return inputCost.Add(outputCost), nil
	}

	// Cache MISS: query database
	modelInfo, err := b.db.Queries.GetModelRate(ctx, dbgen.GetModelRateParams{
		Provider:  provider,
		ModelName: model,
	})
	if err != nil {
		b.logger.Error("failed to load model rates from db", slog.Any("err", err))
		return decimal.Zero, fmt.Errorf("failed to load model rates from db: %w", err)
	}

	inputCost, err := decimal.NewFromString(modelInfo.PromptTokenCostUsd)
	if err != nil {
		return decimal.Zero, fmt.Errorf("invalid input rate for model %q: %w", model, err)
	}

	outputCost, err := decimal.NewFromString(modelInfo.CompletionTokenCostUsd)
	if err != nil {
		return decimal.Zero, fmt.Errorf("invalid output rate for model %q: %w", model, err)
	}

	// Cache result in Redis (async or sync)
	if err := b.rdb.SetModelMetaData(ctx, model, inputCost, outputCost); err != nil {
		b.logger.Warn("failed to cache model metadata in redis", slog.Any("err", err))
	}

	input := inputCost.Mul(decimal.NewFromInt(int64(inputToken)))
	output := outputCost.Mul(decimal.NewFromInt(int64(outputToken)))

	return input.Add(output), nil
}
