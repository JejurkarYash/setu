package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/redis"
)

type Middleware struct {
	db     *database.Database
	rdb    *redis.Client
	logger *slog.Logger
}

type contextKey string

const (
	projectIDKey   contextKey = "project_id"
	providerAPIKey contextKey = "provider_key"
)

// constructor function
func NewMiddleware(db *database.Database, rdb *redis.Client, logger *slog.Logger) *Middleware {

	return &Middleware{
		db:     db,
		rdb:    rdb,
		logger: logger,
	}
}

// middlware
func (m *Middleware) Authenticate(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// development log for (delete it in production)
		m.logger.Debug("request recived:", slog.String("method:", r.Method), slog.String("url:", r.URL.Path))

		// identifying the provider
		var provider string
		if strings.HasPrefix(r.URL.Path, "/v1beta/") {
			provider = "gemini"
		} else if strings.HasPrefix(r.URL.Path, "/v1/") {
			provider = "openai"
		} else if strings.HasPrefix(r.URL.Path, "/anthropic/") {
			provider = "anthropic"
		}

		// extracting keys from respective llm providers
		var rawKey string
		switch provider {
		case "openai":
			auth := r.Header.Get("Authorization")
			rawKey = strings.TrimPrefix(auth, "Bearer ")
			fmt.Println("openaikey:", rawKey)

		case "gemini":
			rawKey = r.Header.Get("x-goog-api-key")
			fmt.Println("geminkey:", rawKey)

		case "anthropic":
			rawKey = r.Header.Get("x-api-key")
			fmt.Println("anthropickey:", rawKey)
		}

		// hash it and check the database
		hash := sha256.Sum256([]byte(rawKey))
		hashedKey := hex.EncodeToString(hash[:])

		// look in redis
		metadata, err := m.rdb.GetKeyMetadata(r.Context(), hashedKey)
		if err != nil {
			m.logger.Error("failed to fetch key metadata from redis", slog.Any("err", err))
		}

		// authenticated
		if metadata != nil {

			// get the current context
			ctx := r.Context()
			ctx = context.WithValue(ctx, projectIDKey, metadata.ProjectID)
			ctx = context.WithValue(ctx, providerAPIKey, metadata.ProviderAPIKey)
			r = r.WithContext(ctx)

		} else { // unauthenticated

			// fetch from db
			dbMeta, err := m.db.Queries.GetActiveKeyMetadata(r.Context(), hashedKey)
			if err != nil {
				m.logger.Warn("database authentication failed", slog.Any("hash", hashedKey), slog.Any("err", err))
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized: Invalide API Key"))
				return
			}
			

			// storing in redis
			cacheMeta := &redis.KeyMetadata{
				ProjectID:   dbMeta.ProjectID,
				BudgetLimit: dbMeta.BudgetLimit,
			}

			err = m.rdb.SetKeyMetadata(r.Context(), hashedKey, cacheMeta, 1*time.Hour)
			if err != nil {
				m.logger.Error("failed to set key metadata ", slog.Any("err", err))
			}

			// injecting projectID into request context
			ctx := r.Context()
			ctx = context.WithValue(ctx, projectIDKey, cacheMeta.ProjectID)
			r = r.WithContext(ctx)
		}

		// checking the budget

		// forwarding request to next

		// steps
		// 1 check the redis to check if with this projectid/apikey someone has made a request ?
		// 2 if yes => then that means authenticated then directly check for the limit
		//   if no -> authenticate first and cache the result
		// 3 check for limit
		//    if yes -> forward request
		// 	  if no -> block the request

		// forwarding request to handler
		next.ServeHTTP(w, r)

	})

}
