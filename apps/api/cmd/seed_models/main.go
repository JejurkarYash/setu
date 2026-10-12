package main

import (
	"context"
	"fmt"
	"log"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/logger"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type ModelSeed struct {
	Provider          string
	ModelName         string
	PromptCostPer1M   decimal.Decimal
	CompleteCostPer1M decimal.Decimal
}

func rate(provider, model, input, output string) ModelSeed {
	return ModelSeed{
		Provider:          provider,
		ModelName:         model,
		PromptCostPer1M:   decimal.RequireFromString(input),
		CompleteCostPer1M: decimal.RequireFromString(output),
	}
}

// Prices are the values from the existing seed list.
// Verify them against current official provider pricing before seeding.
var modelSeeds = []ModelSeed{
	// ---------------- OpenAI ----------------
	rate("openai", "gpt-5.5", "5.00", "30.00"),
	rate("openai", "gpt-5.5-pro", "30.00", "180.00"),
	rate("openai", "gpt-5.4", "2.50", "15.00"),
	rate("openai", "gpt-5.4-nano", "0.20", "1.25"),
	rate("openai", "gpt-4.1", "2.00", "8.00"),
	rate("openai", "gpt-4.1-mini", "0.40", "1.60"),
	rate("openai", "gpt-4.1-nano", "0.10", "0.40"),
	rate("openai", "gpt-4o", "2.50", "10.00"),
	rate("openai", "gpt-4o-mini", "0.15", "0.60"),
	rate("openai", "o1", "15.00", "60.00"),
	rate("openai", "o1-mini", "1.10", "4.40"),
	rate("openai", "o3", "2.00", "8.00"),
	rate("openai", "o3-mini", "1.10", "4.40"),
	rate("openai", "o4-mini", "1.10", "4.40"),

	// ---------------- Anthropic ----------------
	rate("anthropic", "claude-fable-5", "10.00", "50.00"),
	rate("anthropic", "claude-opus-5", "5.00", "25.00"),
	rate("anthropic", "claude-opus-4-8", "5.00", "25.00"),
	rate("anthropic", "claude-3-opus-20240229", "15.00", "75.00"),
	rate("anthropic", "claude-sonnet-5-intro", "2.00", "10.00"),
	rate("anthropic", "claude-sonnet-5", "3.00", "15.00"),
	rate("anthropic", "claude-sonnet-4-6", "3.00", "15.00"),
	rate("anthropic", "claude-3-5-sonnet-20241022", "3.00", "15.00"),
	rate("anthropic", "claude-3-5-sonnet-latest", "3.00", "15.00"),
	rate("anthropic", "claude-3-5-haiku-20241022", "0.80", "4.00"),
	rate("anthropic", "claude-3-5-haiku-latest", "0.80", "4.00"),
	rate("anthropic", "claude-haiku-4-5-20251001", "1.00", "5.00"),

	// ---------------- Google / Gemini ----------------
	rate("gemini", "gemini-3.6-flash", "1.50", "7.50"),
	rate("gemini", "gemini-3.5-flash", "1.50", "9.00"),
	rate("gemini", "gemini-3.5-flash-lite", "0.30", "2.50"),
	rate("gemini", "gemini-3.1-flash-lite", "0.25", "1.50"),
	rate("gemini", "gemini-3.1-pro-preview", "2.00", "12.00"),
	rate("gemini", "gemini-2.5-pro", "1.25", "10.00"),
	rate("gemini", "gemini-2.5-flash", "0.30", "2.50"),
	rate("gemini", "gemini-2.5-flash-lite", "0.10", "0.40"),
	rate("gemini", "gemini-2.0-flash", "0.10", "0.40"),
	rate("gemini", "gemini-2.0-flash-lite", "0.075", "0.30"),
	rate("gemini", "gemini-1.5-pro", "1.25", "5.00"),
	rate("gemini", "gemini-1.5-flash", "0.075", "0.30"),
}

const upsertModelRateQuery = `
	INSERT INTO model_rates (
		provider,
		model_name,
		prompt_token_cost_usd,
		completion_token_cost_usd,
		updated_at
	)
	VALUES ($1, $2, $3, $4, NOW())
	ON CONFLICT (model_name) DO UPDATE SET
		provider = EXCLUDED.provider,
		prompt_token_cost_usd = EXCLUDED.prompt_token_cost_usd,
		completion_token_cost_usd = EXCLUDED.completion_token_cost_usd,
		updated_at = NOW()
`

func seedModelRates(
	ctx context.Context,
	pool *pgxpool.Pool,
	seeds []ModelSeed,
) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin seed transaction: %w", err)
	}
	defer func() {
		// After a successful commit, this rollback has no effect.
		_ = tx.Rollback(context.Background())
	}()

	million := decimal.NewFromInt(1_000_000)

	for _, m := range seeds {
		// Exact decimal division: no float64 conversion.
		promptCost := m.PromptCostPer1M.Div(million)
		completionCost := m.CompleteCostPer1M.Div(million)

		// Pass decimal strings to PostgreSQL NUMERIC columns.
		_, err := tx.Exec(
			ctx,
			upsertModelRateQuery,
			m.Provider,
			m.ModelName,
			promptCost.String(),
			completionCost.String(),
		)
		if err != nil {
			return fmt.Errorf(
				"seed model %s (%s): %w",
				m.ModelName,
				m.Provider,
				err,
			)
		}

		fmt.Printf(
			"Seeded [%s] %-32s input=$%s/token output=$%s/token\n",
			m.Provider,
			m.ModelName,
			promptCost.String(),
			completionCost.String(),
		)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit model rates: %w", err)
	}

	return nil
}

func main() {
	fmt.Println("Model rates seeding started...")

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	appLogger, err := logger.NewLoggger(cfg)
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}

	db, err := database.New(cfg, appLogger)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	if err := seedModelRates(ctx, db.Pool, modelSeeds); err != nil {
		log.Fatalf("model rates seeding failed: %v", err)
	}

	fmt.Printf(
		"\nSuccessfully seeded %d model rates!\n",
		len(modelSeeds),
	)
}

// Compile-time check that pgx.Tx is the transaction interface used above.
var _ pgx.Tx
