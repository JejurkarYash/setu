package project

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v5/pgconn"
)

type Handler struct {
	db     *database.Database
	logger *slog.Logger
}

type CreateProjectRequest struct {
	Name   string  `json:"name"`
	Budget float64 `json:"monthly_budget"`
}

func NewHandler(db *database.Database, logger *slog.Logger) *Handler {
	return &Handler{
		db:     db,
		logger: logger,
	}
}

// registering routes
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	// registering routes
	r.Post("/", h.CreateProject)
	r.Get("/", h.ListProjects)
	r.Get("/{id}", h.GetProjectByID)
	r.Patch("/{id}", h.UpdateProject)
	r.Post("/{id}/reset-budget", h.ResetMonthlyBudgetUsage)
	r.Delete("/{id}", h.DeleteProject)

	return r

}

// handler methods
func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {

	var req CreateProjectRequest
	if err := utils.ReadJSON(r, &req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	fmt.Println("budget:", req.Budget)
	parms := dbgen.CreateProjectParams{
		Name:          req.Name,
		MonthlyBudget: req.Budget,
		UserID:        userID,
	}

	// storing in DB
	project, err := h.db.Queries.CreateProject(r.Context(), parms)
	var pgErr *pgconn.PgError
	if err != nil {
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" { // -> if project already exist
				utils.WriteError(w, http.StatusConflict, "record already exist!")
				return
			}
		}
		utils.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.WriteJSON(w, http.StatusOK, project)
	return
}

func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) GetProjectByID(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) UpdateProject(w http.ResponseWriter, r *http.Request) {

}
func (h *Handler) ResetMonthlyBudgetUsage(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {

}
