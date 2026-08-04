package logger

import (
	"log/slog"
	"os"

	"github.com/JejurkarYash/setu/internal/config"
)

func NewLoggger(cfg *config.Config) (*slog.Logger, error) {
	var logLevel slog.Level

	switch cfg.Primary.LoggerLevel {
	case "debug":
		logLevel = slog.LevelDebug
	case "info":
		logLevel = slog.LevelInfo
	case "error":
		logLevel = slog.LevelError

	default:
		logLevel = slog.LevelWarn
	}

	opts := &slog.HandlerOptions{
		Level: logLevel,
	}

	var handler slog.Handler

	if cfg.Primary.Env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	handler = slog.NewTextHandler(os.Stdout, opts)

	return slog.New(handler), nil
}
