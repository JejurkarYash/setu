package router

import (
	"net/http"

	"github.com/go-chi/chi"
)

type Router struct {
	router *chi.Mux
}

func NewRouter() *chi.Mux {
	r := chi.NewRouter()

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running..."))
	})

	return r
}

func RegisterRoutes() error {

	return nil
}
