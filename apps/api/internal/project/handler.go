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
	"github.com/jackc/pgx/v5"
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

type ListProjectsResponse struct {
	Projects []dbgen.Project `json:"projects"`
}

type UpdateProjectResponse struct {
	Project dbgen.Project
}

type UpdateProjectRequest struct {
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

	if req.Budget == 0 || req.Name == "" {
		utils.WriteError(w, http.StatusBadRequest, "name and budget required")
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

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}

	// getting projects from db
	projects, err := h.db.Queries.ListProjectsByUserID(r.Context(), userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.WriteJSON(w, http.StatusOK, ListProjectsResponse{Projects: projects})
	return
}

func (h *Handler) GetProjectByID(w http.ResponseWriter, r *http.Request) {

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "project id required")
		return
	}

	// fetching project from db
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	var pgErr *pgconn.PgError
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "record not found")
			return
		}

		if errors.As(err, &pgErr) {
			if pgErr.Code == "22P02" {
				utils.WriteError(w, http.StatusBadRequest, "provide valid id")
				return
			}
		}

		utils.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.WriteJSON(w, http.StatusOK, project)
	return

}

func (h *Handler) UpdateProject(w http.ResponseWriter, r *http.Request) {

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "project id required")
		return
	}

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	var req UpdateProjectRequest
	err := utils.ReadJSON(r, &req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	// check if project with this id present or not
	existingProject, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "project not found")
			return
		}

		utils.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if existingProject.UserID != userID {
		utils.WriteError(w, http.StatusForbidden, "you do not have permission to update this project")
		return
	}

	updatedName := existingProject.Name
	if req.Name != "" {
		updatedName = req.Name
	}
	updatedBudget := existingProject.MonthlyBudget
	if req.Budget > 0 {
		updatedBudget = req.Budget
	}

	// update/patch the request
	project, err := h.db.Queries.UpdateProject(r.Context(), dbgen.UpdateProjectParams{
		ID:            projectID,
		Name:          updatedName,
		MonthlyBudget: updatedBudget,
	})
	var pgErr *pgconn.PgError
	if err != nil {
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				utils.WriteError(w, http.StatusConflict, "project with this name already exist")
				return
			}
		}
		utils.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.WriteJSON(w, http.StatusOK, UpdateProjectResponse{Project: project})
	return
}

func (h *Handler) ResetMonthlyBudgetUsage(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {

}
