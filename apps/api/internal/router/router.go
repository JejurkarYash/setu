package router

import (
	"net/http"

	"github.com/JejurkarYash/setu/internal/providers/gemini"
	"github.com/go-chi/chi"
)

type Router struct {
	router *chi.Mux
}

func NewRouter(geminiRouter *gemini.Handler) *chi.Mux {

	r := chi.NewRouter()

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running..."))
	})

	// mounting the gemini sub-routes
	r.Mount("/v1beta", geminiRouter.Routes())

	return r
}
