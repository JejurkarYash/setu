package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	rdb *redis.Client
}

type KeyMetadata struct {
	ProjectID      string  `json:"project_id"`
	BudgetLimit    float64 `json:"budget_limit"`
	ProviderAPIKey string  `json:"provider_key"`
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

// method to increment the spend
func (c *Client) IncrSpend(ctx context.Context, model, projectID string, amount float64) error {
	currentMonth := time.Now().UTC().Format("2006-01")
	key := fmt.Sprintf("project:%s:spend:%s", projectID, currentMonth)
	return c.rdb.IncrByFloat(ctx, key, amount).Err()
}

// method to check the budget
func (c *Client) GetSpend(ctx context.Context, projectID string) (float64, error) {
	currentMonth := time.Now().UTC().Format("2006-01")
	key := fmt.Sprintf("project:%s:spend:%s", projectID, currentMonth)
	val, err := c.rdb.Get(ctx, key).Float64()
	if err == redis.Nil {
		return 0.0, nil
	}

	if err != nil {
		return 0.0, fmt.Errorf("error getting spend: %w", err)
	}

	return val, nil
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
