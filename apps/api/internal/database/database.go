package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"log/slog"
	"time"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pressly/goose/v3"

	// anonymous import to register pgx driver to goose
	_ "github.com/jackc/pgx/v5/stdlib"
)

// embedding the migrations
//
//go:embed migrations/*.sql
var embeddedMigrations embed.FS

type Database struct {
	pool   *pgxpool.Pool
	logger *slog.Logger
	dsn    string
}

func New(cfg *config.Config, logger *slog.Logger) (*Database, error) {

	// creating DSN string
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s", cfg.Database.User, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port, cfg.Database.DBName, cfg.Database.SSLMode)

	// parsing DSN string
	poolConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database DSN:%w", err)
	}

	// setting the pool config
	if cfg.Database.MaxOpenConns > 0 {
		poolConfig.MaxConns = int32(cfg.Database.MaxOpenConns)
	}
	if cfg.Database.MaxIdleConns > 0 {
		poolConfig.MinConns = int32(cfg.Database.MaxIdleConns)
	}
	if cfg.Database.ConnMaxLifetime > 0 {
		poolConfig.MaxConnLifetime = time.Duration(cfg.Database.ConnMaxLifetime) * time.Second
	}

	if cfg.Database.ConnMaxIdleTime > 0 {
		poolConfig.MaxConnIdleTime = time.Duration(cfg.Database.ConnMaxIdleTime) * time.Second
	}

	// creting timeout context
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)

	// ping the database to ensure connection is alive
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping postgres:%w", err)

	}

	logger.Debug("PostgreSQL connection pool initialized succesfully")

	db := &Database{
		pool:   pool,
		logger: logger,
		dsn:    dsn,
	}

	// running migrations
	if err := db.RunMigrations(); err != nil {
		return nil, fmt.Errorf("failed to run database migrations:%w", err)
	}

	return db, nil
}

func (db *Database) RunMigrations() error {

	db.logger.Debug("Running database migrations...")

	// goose reqquires a database/sql connection
	// opening temproary connection

	sqlDB, err := sql.Open("pgx", db.dsn)
	if err != nil {
		return fmt.Errorf("failed to open sql connection for migrations:%w", err)
	}
	defer sqlDB.Close()

	// direct goose to load the sql from the embeed
	goose.SetBaseFS(embeddedMigrations)
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}

	// exectuting migrations
	if err := goose.Up(sqlDB, "migrations"); err != nil {
		return fmt.Errorf("failed to apply migrations:%w", err)
	}

	return nil
}

// method to handle graceful shutdown
func (db *Database) Close() {
	if db.pool != nil {
		db.logger.Debug("PostgreSQL is closing...")
		db.pool.Close()
	}

}
