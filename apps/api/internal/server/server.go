package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/go-chi/chi"
)

type Server struct {
	Config     *config.Config
	Router     *chi.Mux
	Logger     *slog.Logger
	httpServer *http.Server
}

func NewServer(cfg *config.Config, handler *chi.Mux, logger *slog.Logger) (*Server, error) {
	return &Server{
		Config: cfg,
		Logger: logger,
		httpServer: &http.Server{
			Addr: fmt.Sprintf(":%d", cfg.Server.Port),
			Handler:handler, 
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
	if err := s.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("failed to stop the HTTP Server:%w", err)
	}
	return nil
}
