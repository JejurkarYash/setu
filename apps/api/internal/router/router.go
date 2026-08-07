package router

import (
	"net/http"

	"github.com/JejurkarYash/setu/internal/providers/gemini"
	"github.com/JejurkarYash/setu/internal/providers/openai"
	"github.com/go-chi/chi"
)

type Router struct {
	router *chi.Mux
}

func NewRouter(geminiRouter *gemini.Handler, openAIRouter *openai.Handler) *chi.Mux {

	r := chi.NewRouter()

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running..."))
	})

	// mounting the gemini sub-routes
	r.Mount("/v1beta", geminiRouter.Routes())
	// mounting the openai sub-routes
	r.Mount("/v1", openAIRouter.Routes())

	return r
}
