package router

import (
	"net/http"

	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/JejurkarYash/setu/internal/project"
	"github.com/JejurkarYash/setu/internal/providers/anthropic"
	"github.com/JejurkarYash/setu/internal/providers/gemini"
	"github.com/JejurkarYash/setu/internal/providers/openai"
	"github.com/JejurkarYash/setu/internal/users"
	"github.com/go-chi/chi"
)

type RouterConfig struct {
	Middleware     *middleware.Middleware
	GeminiHandler  *gemini.Handler
	OpenAIHandler  *openai.Handler
	Anthropic      *anthropic.Handler
	UserHandler    *users.Handler
	ProjectHandler *project.Handler
}

func NewRouter(cfg *RouterConfig) *chi.Mux {

	r := chi.NewRouter()

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running..."))
	})

	// Core Routes (LLM Routes)
	r.Group(func(r chi.Router) {
		// middleware
		r.Use(cfg.Middleware.AuthenticateLLM)

		// mounting the gemini sub-routes
		r.Mount("/v1beta", cfg.GeminiHandler.Routes())
		// mounting the openai sub-routes
		r.Mount("/v1", cfg.OpenAIHandler.Routes())
		// mounting the anthropic sub-routes
		r.Mount("/anthropic", cfg.Anthropic.Routes())

	})

	// registering NON-LLM routes
	r.Route("/api/v1", func(r chi.Router) { // -> /api/v1/...

		// user(auth) routes -> Non Protected route
		r.Mount("/user", cfg.UserHandler.Routes(cfg.Middleware)) // /api/v1/user/google -> creting user

		// PROTECTED ROUTES

		// project routes
	})

	return r
}
