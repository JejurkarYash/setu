package users

import (
	"net/http"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/go-chi/chi"
)

type Handler struct {
	db *database.Database
}

func NewHandler(db *database.Database) *Handler {
	return &Handler{
		db: db,
	}
}

// registering users routes
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	// register routes here
	
	return r
}

// handler methods
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {

}
