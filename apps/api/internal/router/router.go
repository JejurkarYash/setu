package router

import (
	"net/http"

	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/JejurkarYash/setu/internal/providers/anthropic"
	"github.com/JejurkarYash/setu/internal/providers/gemini"
	"github.com/JejurkarYash/setu/internal/providers/openai"
	"github.com/go-chi/chi"
)

type Router struct {
	router *chi.Mux
}

func NewRouter(geminiRouter *gemini.Handler, openAIRouter *openai.Handler, anthropicRouter *anthropic.Handler, mw middleware.Middleware) *chi.Mux {

	r := chi.NewRouter()

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running..."))
	})

	r.Group(func(r chi.Router) {

		// middleware
		r.Use(mw.Authenticate)

	// mounting the gemini sub-routes
	r.Mount("/v1beta", geminiRouter.Routes())
	// mounting the openai sub-routes
	r.Mount("/v1", openAIRouter.Routes())
	// mounting the anthropic sub-routes
	r.Mount("/anthropic", anthropicRouter.Routes())

	})

	return r
}
