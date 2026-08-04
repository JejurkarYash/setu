package main

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/logger"
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

	// router
	router := router.NewRouter()
	// server init
	server, err := server.NewServer(config, router, appLogger)
	if err != nil {
		appLogger.Error("failed to start HTTP server")
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

func processStreamUsage(r io.Reader) (UsageMetadata, error) {
	scanner := bufio.NewScanner(r)
	var finalUsage UsageMetadata

	for scanner.Scan() {
		line := scanner.Text()

		// Filter for Server-Sent Event data lines
		if strings.HasPrefix(line, "data: ") {
			jsonData := strings.TrimPrefix(line, "data: ")

			var chunk GeminiStreamChunk
			if err := json.Unmarshal([]byte(jsonData), &chunk); err == nil {
				// Keep overwriting so we hold the final accurate token count
				if chunk.UsageMetadata.TotalTokenCount > 0 {
					finalUsage = chunk.UsageMetadata
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return finalUsage, err
	}

	return finalUsage, nil
}
