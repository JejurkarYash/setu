package server

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/go-chi/chi"
)

type Server struct {
	Config     *config.Config
	Router     *chi.Mux
	Logger     *slog.Logger
	httpServer *http.Server
	dbPool     *database.Database
}

func NewServer(cfg *config.Config, handler *chi.Mux, logger *slog.Logger, rdb *redis.Client) (*Server, error) {

	// database init
	db, err := database.New(cfg, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to initialized database:%w", err)
	}

	return &Server{
		Config: cfg,
		Logger: logger,
		dbPool: db,
		httpServer: &http.Server{
			Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
			Handler: handler,
		},
	}, nil
}

// starting the server
func (s *Server) Start() error {
	if s.httpServer == nil {
		return fmt.Errorf("router is not initializedß")
	}
	s.Logger.Debug("HTTP Server starting..", slog.Any("port:", s.Config.Server.Port))
	return s.httpServer.ListenAndServe()
}

// handling graceful shutdown
func (s *Server) Stop(ctx context.Context) error {
	if s.httpServer == nil {
		return errors.New("HTTP Server is not initialized")
	}

	// clost the db first
	s.dbPool.Close()
	// clossing the server finally

	if err := s.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("failed to stop the HTTP Server:%w", err)
	}
	s.Logger.Debug("shutting down the server...")
	return nil
}
