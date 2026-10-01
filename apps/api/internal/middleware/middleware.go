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

// getter functions -> for extracting apikey and project from reuqest context

func GetProviderKey(ctx context.Context) (string, bool) {
	val, ok := ctx.Value(providerAPIKey).(string)
	return val, ok
}

func GetProjectID(ctx context.Context) (string, bool) {
	val, ok := ctx.Value(projectIDKey).(string)
	return val, ok
}

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

		case "gemini":
			rawKey = r.Header.Get("x-goog-api-key")

		case "anthropic":
			rawKey = r.Header.Get("x-api-key")
		}

		// hash it and check the database
		hash := sha256.Sum256([]byte(rawKey))
		hashedKey := hex.EncodeToString(hash[:])

		var projectID string
		var budgetLimit float64

		// look in redis
		metadata, err := m.rdb.GetKeyMetadata(r.Context(), hashedKey)
		if err != nil {
			m.logger.Debug("metadat is not present in redis")
		}

		// authenticated
		if metadata != nil {

			fmt.Println("metadata:", metadata)

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

			fmt.Println("dbMeta", dbMeta)

			// setting projectID & budgetLimit
			projectID = dbMeta.ProjectID
			budgetLimit = dbMeta.BudgetLimit

			// fetching provider key
			keyRecord, err := m.db.Queries.GetProviderKey(r.Context(), dbgen.GetProviderKeyParams{
				ProjectID: dbMeta.ProjectID,
				Provider:  provider,
			})

			// decrypyting llm api key
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
			ctx = context.WithValue(ctx, providerAPIKey, cacheMeta.ProviderAPIKey)

			r = r.WithContext(ctx)
		}

		// checking the budget
		cost, err := m.rdb.GetSpend(r.Context(), projectID)
		if err != nil {
			m.logger.Error("failed to check budget", slog.Any("err", err))
		}

		fmt.Println("cost:", cost)

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
