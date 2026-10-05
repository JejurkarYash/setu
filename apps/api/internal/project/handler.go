package project

import (
	"log/slog"
	"net/http"

	"github.com/JejurkarYash/setu/internal/database"
)

type Handler struct {
	db     *database.Database
	logger *slog.Logger
}

func NewHandler(db *database.Database, logger *slog.Logger) *Handler {
	return &Handler{
		db:     db,
		logger: logger,
	}
}

// handler methods
func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {

}
