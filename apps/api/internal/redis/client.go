package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	rdb *redis.Client
}

func NewClient(addr string) (*Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	// ping the redis to make sure connection is alive
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		return nil, err
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
