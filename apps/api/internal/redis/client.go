package redis

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/shopspring/decimal"
)

type Client struct {
	rdb *redis.Client
}

type KeyMetadata struct {
	ProjectID      string          `json:"project_id"`
	BudgetLimit    decimal.Decimal `json:"budget_limit"`
	ProviderAPIKey string          `json:"provider_key"`
}

type ModelRates struct {
	InputCost  decimal.Decimal
	OutputCost decimal.Decimal
}

// constructor function
func NewClient(addr string) (*Client, error) {

	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	// ping the redis to make sure connection is alive
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping redis:%w", err)
	}
	return &Client{
		rdb: rdb,
	}, nil
}

const spendScale int32 = 10

func (c *Client) IncrSpend(
	ctx context.Context,
	model string,
	projectID string,
	amount decimal.Decimal,
) error {
	currentMonth := time.Now().UTC().Format("2006-01")
	key := fmt.Sprintf("project:%s:spend:%s", projectID, currentMonth)

	// Convert USD to integer units of 10^-10 dollars.
	scaledAmount := amount.Shift(spendScale)

	// Reject values that cannot be represented exactly at this scale.
	if !scaledAmount.Equal(scaledAmount.Truncate(0)) {
		return fmt.Errorf("spend amount exceeds supported decimal precision: %s", amount)
	}

	if scaledAmount.IsNegative() {
		return fmt.Errorf("spend amount cannot be negative: %s", amount)
	}

	return c.rdb.IncrBy(ctx, key, scaledAmount.IntPart()).Err()
}

func (c *Client) GetSpend(
	ctx context.Context,
	projectID string,
) (decimal.Decimal, error) {
	currentMonth := time.Now().UTC().Format("2006-01")
	key := fmt.Sprintf("project:%s:spend:%s", projectID, currentMonth)

	units, err := c.rdb.Get(ctx, key).Int64()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return decimal.Zero, nil
		}
		return decimal.Zero, err
	}

	return decimal.NewFromInt(units).Shift(-spendScale), nil
}

// reset spend (cache invalidation)
func (c *Client) ResetSpend(ctx context.Context, projectID string) error {
	currMonth := time.Now().UTC().Format("2006-01")
	key := fmt.Sprintf("project:%s:spend:%s", projectID, currMonth)
	return c.rdb.Del(ctx, key).Err()
}

// auth middleware methods
func (c *Client) GetKeyMetadata(ctx context.Context, hashedKey string) (*KeyMetadata, error) {
	// get the val from redis
	key := "api_key:" + hashedKey
	val, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	// unmarshal it
	var metadata KeyMetadata
	if err := json.Unmarshal([]byte(val), &metadata); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Key Metadata :%w", err)
	}

	return &metadata, nil
}

// set method so set the key
func (c *Client) SetKeyMetadata(ctx context.Context, hashedKey string, metadata *KeyMetadata, ttl time.Duration) error {
	key := "api_key:" + hashedKey

	// serialize the key metadata
	val, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal key metadata: %w", err)
	}

	return c.rdb.Set(ctx, key, val, ttl).Err()
}

// cache invalidation
func (c *Client) DeleteKeyMetadata(ctx context.Context, hashedKey string) error {

	key := "api_key:" + hashedKey
	return c.rdb.Del(ctx, key).Err()
}

// method for closing redis instance
func (c *Client) Close() error {
	return c.rdb.Close()
}

// Model Rates
func (c *Client) SetModelMetaData(ctx context.Context, modelName string, inputTokenCost, outputTokenCost decimal.Decimal) error {
	key := "setu:model_rates:" + modelName

	err := c.rdb.HSet(ctx, key, map[string]interface{}{
		"input_cost":  inputTokenCost.String(),
		"output_cost": outputTokenCost.String(),
	}).Err()
	if err != nil {
		return fmt.Errorf("failed to set the model metadata")
	}

	return c.rdb.Expire(ctx, key, 5*time.Minute).Err()
}

func (c *Client) GetModelData(ctx context.Context, modelName string) (ModelRates, bool, error) {
	key := "setu:model_rates:" + modelName

	values, err := c.rdb.HGetAll(ctx, key).Result()
	if err != nil {
		return ModelRates{}, false, err
	}

	// Cache miss
	if len(values) == 0 {
		return ModelRates{}, false, nil
	}

	inputCost, err := decimal.NewFromString(values["input_cost"])
	if err != nil {
		return ModelRates{}, false, err
	}

	outputCost, err := decimal.NewFromString(values["output_cost"])
	if err != nil {
		return ModelRates{}, false, err
	}

	return ModelRates{
		InputCost:  inputCost,
		OutputCost: outputCost,
	}, true, nil
}
