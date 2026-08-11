package database

import (
	"log/slog"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	pool   *pgxpool.Pool
	logger *slog.Logger
}

func New(cfg config.Config, logger *slog.Logger) (*Database, error) {
	 
	
	return 
}
