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
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/redis"
)

type Middleware struct {
	db        *database.Database
	rdb       *redis.Client
	logger    *slog.Logger
	encryptor *utils.Encryptor
}

type contextKey string

const (
	projectIDKey   contextKey = "project_id"
	providerAPIKey contextKey = "provider_key"
)

// constructor function
func NewMiddleware(db *database.Database, rdb *redis.Client, logger *slog.Logger, encryptor *utils.Encryptor) *Middleware {

	return &Middleware{
		db:        db,
		rdb:       rdb,
		logger:    logger,
		encryptor: encryptor,
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

		var projectID string
		var budgetLimit float64

		// look in redis
		metadata, err := m.rdb.GetKeyMetadata(r.Context(), hashedKey)
		if err != nil {
			m.logger.Error("failed to fetch key metadata from redis", slog.Any("err", err))
		}

		// authenticated
		if metadata != nil {

			// setting projectID & budgetLimit
			projectID = metadata.ProjectID
			budgetLimit = metadata.BudgetLimit

			// get the current context
			ctx := r.Context()
			ctx = context.WithValue(ctx, projectIDKey, metadata.ProjectID)
			ctx = context.WithValue(ctx, providerAPIKey, metadata.ProviderAPIKey) // writing llm key into request context
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

			// setting projectID & budgetLimit
			projectID = dbMeta.ProjectID
			budgetLimit = dbMeta.BudgetLimit

			// fetching provider key
			keyRecord, err := m.db.Queries.GetProviderKey(r.Context(), dbgen.GetProviderKeyParams{
				ProjectID: dbMeta.ProjectID,
				Provider:  provider,
			})

			// decrypyting key
			decryptedKey, err := m.encryptor.Decrypt(keyRecord.EncryptedKey, keyRecord.Nonce)
			if err != nil {
				m.logger.Error("failed to decrypyt key", slog.Any("err", err))
				return
			}

			// storing in redis
			cacheMeta := &redis.KeyMetadata{
				ProjectID:      dbMeta.ProjectID,
				BudgetLimit:    dbMeta.BudgetLimit,
				ProviderAPIKey: decryptedKey,
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
		cost, err := m.rdb.GetSpend(r.Context(), projectID)
		if err != nil {
			m.logger.Error("failed to check budget", slog.Any("err", err))
		}

		if cost > budgetLimit {
			//  block the request

			// logging
			m.logger.Info("request is block", slog.String("projectID", projectID), slog.Float64("budget", budgetLimit), slog.Float64("cost", cost))

			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte("Quota Exceeded:Too Many Requests"))
			return
		}

		// forwarding request to handler
		next.ServeHTTP(w, r)

	})

}
