package main

import (
	"context"
	"errors"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/logger"
	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/JejurkarYash/setu/internal/project"
	"github.com/JejurkarYash/setu/internal/providers/anthropic"
	"github.com/JejurkarYash/setu/internal/providers/gemini"
	"github.com/JejurkarYash/setu/internal/providers/openai"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/JejurkarYash/setu/internal/router"
	"github.com/JejurkarYash/setu/internal/server"
	"github.com/JejurkarYash/setu/internal/telemetry"
	"github.com/JejurkarYash/setu/internal/users"
)

type GeminiStreamChunk struct {
	UsageMetadata UsageMetadata `json:"usageMetadata"`
}

type UsageMetadata struct {
	PromptTokenCount     int `json:"promptTokenCount"`
	CandidatesTokenCount int `json:"candidatesTokenCount"`
	TotalTokenCount      int `json:"totalTokenCount"`
	ThoughtsTokenCount   int `json:"thoughtsTokenCount"` // Reasoning tokens!
}

// Custom ReadCloser that closes PipeWriter when the HTTP response body finishes
type bodyWrapper struct {
	io.Reader
	body io.Closer
	pw   *io.PipeWriter
}

func (b *bodyWrapper) Close() error {
	// 1. Close the PipeWriter so io.Copy in the goroutine receives io.EOF
	b.pw.Close()
	// 2. Close the actual HTTP response body
	return b.body.Close()
}

func main() {
	// loading config
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatal("failed to load config")
		os.Exit(1)
	}

	// intializeing logger
	appLogger, err := logger.NewLoggger(config)
	if err != nil {
		log.Fatal("failed to initialized logger")
		os.Exit(1)
	}

	// database init
	db, err := database.New(config, appLogger)
	if err != nil {
		appLogger.Error("failed to initialized database:", slog.Any("err", err))
	}

	// redis initalization
	rdb, err := redis.NewClient(config.Redis.Address)
	if err != nil {
		appLogger.Error("failed to init redis", slog.Any("err", err))
	} else {
		appLogger.Info("redis is connected...")
	}

	// batcher ( for processing events )  -> also spin 5 background goroutines to process events
	batcher := telemetry.NewBatcher(db, appLogger, 1000, 5)

	// creating new encrytor
	encryptor, _ := utils.NewEncryptor(config.Encryption.MasterKey)
	// middleware init
	middleware := middleware.NewMiddleware(db, rdb, appLogger, encryptor)

	// LLM Provider Handlers
	geminiHandler := gemini.NewHandler(config, appLogger, rdb, db, batcher)
	openAIHandler := openai.NewHandler(config, appLogger, rdb, db, batcher)
	anthropicHandler := anthropic.NewHandler(config, appLogger, rdb, db, batcher)

	// NON-LLM Handlers
	userHandler := users.NewHandler(db, appLogger)
	projectHandler := project.NewHandler(db, appLogger, rdb)

	// constructing router config ( dependencies )
	routerConfig := router.RouterConfig{
		Middleware:     middleware,
		GeminiHandler:  geminiHandler,
		OpenAIHandler:  openAIHandler,
		Anthropic:      anthropicHandler,
		UserHandler:    userHandler,
		ProjectHandler: projectHandler,
	}

	router := router.NewRouter(&routerConfig)

	// server init
	server, err := server.NewServer(config, router, appLogger, rdb, db)
	if err != nil {
		appLogger.Error("failed to start HTTP server", slog.Any("err", err))
		os.Exit(1)
	}

	// starting the server in new goroutine
	go func() {
		if err := server.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("failed to start the server")
		}
	}()

	// listeing to os signals for interuptions
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	<-ctx.Done()
	stop() // Realase OS signal resource

	// 10 sec deadline for shuttind down server
	shutDownCtx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	// shutting down server
	if err := server.Stop(shutDownCtx); err != nil {
		log.Fatal("failed to shutdown the server")
		appLogger.Error("failed to shutdown HTTP Server cleanly", slog.Any("err", err))
	}

	// closing batcher
	batcher.Close()
	appLogger.Info("telemetry batcher flushed remaining logs and stopped")

	// closing db
	db.Close()
	appLogger.Info("database pool closed")

	// clossing redis
	if err := rdb.Close(); err != nil {
		appLogger.Error("failed to close redis connection", slog.Any("err", err))
	} else {
		appLogger.Info("redis connection closed")
	}
	appLogger.Info("server exited cleanly")

}
