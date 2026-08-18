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
	"github.com/JejurkarYash/setu/internal/logger"
	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/JejurkarYash/setu/internal/providers/anthropic"
	"github.com/JejurkarYash/setu/internal/providers/gemini"
	"github.com/JejurkarYash/setu/internal/providers/openai"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/JejurkarYash/setu/internal/router"
	"github.com/JejurkarYash/setu/internal/server"
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
		appLogger.Debug("redis is connected...")
	}

	// Handlers init
	geminiHandler := gemini.NewHandler(config, appLogger, rdb)
	openAIHandler := openai.NewHandler(config, appLogger, rdb)
	anthropicHandler := anthropic.NewHandler(config, appLogger, rdb)

	// middleware init
	middleware := middleware.NewMiddleware(db, rdb, appLogger)
	// passing LLM provider's handlers to router to register routes
	router := router.NewRouter(geminiHandler, openAIHandler, anthropicHandler, *middleware)

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
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	if err := server.Stop(ctx); err != nil {
		log.Fatal("failed to shutdown the server")

	}
	stop()
	cancel()

	appLogger.Info("server exited properly")
}
