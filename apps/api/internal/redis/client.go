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

func NewClient(addr string) (*Client, error) {

	fmt.Println("Addr:", addr)

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
	key := "project:" + projectID + ":spend"
	return c.rdb.IncrByFloat(ctx, key, amount).Err()
}

// method to check the budge
func (c *Client) GetSpend(ctx context.Context, projectID string) bool {

	return false
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
