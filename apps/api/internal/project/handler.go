package project

import (
	"net/http"

	"github.com/JejurkarYash/setu/internal/database"
)

type Handler struct {
	db *database.Database
}

func NewHandler(db *database.Database) *Handler {
	return &Handler{
		db: db,
	}
}

// handler methods
func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {

}
