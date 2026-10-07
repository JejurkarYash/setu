package project

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type Handler struct {
	db     *database.Database
	logger *slog.Logger
	rdb    *redis.Client
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

func NewHandler(db *database.Database, logger *slog.Logger, rdb *redis.Client) *Handler {
	return &Handler{
		db:     db,
		logger: logger,
		rdb:    rdb,
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
		utils.WriteError(w, http.StatusBadRequest, "Bad Request")
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

	// attach context to logger
	logger := h.logger.With(
		slog.String("user_id", userID),
	)

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
				logger.Warn("project creation failed: project already exist")
				utils.WriteError(w, http.StatusConflict, "record already exist!")
				return
			}
		}
		logger.Error("failed to create project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	logger.Info("project created successfully")
	utils.WriteJSON(w, http.StatusOK, project)
	return
}

func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}

	// attach context to logger
	logger := h.logger.With(
		slog.String("user_id", userID),
	)

	// getting projects from db
	projects, err := h.db.Queries.ListProjectsByUserID(r.Context(), userID)
	if err != nil {
		logger.Error("failed to fetch project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project")
		return
	}

	logger.Info("projects list successfully")
	utils.WriteJSON(w, http.StatusOK, ListProjectsResponse{Projects: projects})
	return
}

func (h *Handler) GetProjectByID(w http.ResponseWriter, r *http.Request) {

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "project id required")
		return
	}

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// fetching project from db
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	var pgErr *pgconn.PgError
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {

			logger.Warn("failed to fetch project: project not found")
			utils.WriteError(w, http.StatusNotFound, "project not found")
			return
		}

		if errors.As(err, &pgErr) {
			if pgErr.Code == "22P02" {
				utils.WriteError(w, http.StatusBadRequest, "provide valid id")
				return
			}
		}

		h.logger.Error("failed to fetch project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project")
		return
	}

	logger.Info("project fetched successfully")
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

	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

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
			logger.Warn("failed to update project: project not found")
			utils.WriteError(w, http.StatusNotFound, "project not found")
			return
		}
		logger.Error("failed to update project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to update project")
		return
	}
	if existingProject.UserID != userID {
		logger.Warn("unauthorized attempt to update project", slog.String("owner_id", existingProject.ID))
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
				logger.Warn("failed to update project: project name conflict")
				utils.WriteError(w, http.StatusConflict, "project with this name already exist")
				return
			}
		}

		logger.Error("failed to update the project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to update the project")
		return
	}

	// cache invalidation
	if req.Budget > 0 {
		// call api key to get hash
		keyHash, err := h.db.Queries.GetKeyHashFromProjectID(r.Context(), projectID)
		if err != nil {
			logger.Warn("(cache invalidation):failed to fetch key hash from db")
		}

		// metadata
		err = h.rdb.DeleteKeyMetadata(r.Context(), keyHash)
		if err != nil {
			logger.Warn("(cache invalidation):failed to delete keyMetadata from redis")
		}
	}

	logger.Info("project updated successfully")
	utils.WriteJSON(w, http.StatusOK, UpdateProjectResponse{Project: project})
	return
}

// cache Invalidation
func (h *Handler) ResetMonthlyBudgetUsage(w http.ResponseWriter, r *http.Request) {

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "project id is required")
		return
	}

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// checking if this project is belongs to this user
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) { // that means no project found with tihs
			logger.Error("failed to reset budget: project not found", slog.Any("err", err))
			utils.WriteError(w, http.StatusForbidden, "project not found")
			return
		}

		logger.Error("failed to reset budget ", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project")
		return
	}

	// safty check
	if project.UserID != userID {
		logger.Warn("unauthorized attempt to reset budget", slog.String("owner_id", project.ID))
		utils.WriteError(w, http.StatusForbidden, "you don't have access to this project")
		return
	}

	// reseting  spend into db
	_, err = h.db.Queries.UpdateSpendDB(r.Context(), dbgen.UpdateSpendDBParams{
		ID:    projectID,
		Spend: 0.00,
	})
	if err != nil {
		logger.Error("failed to update spend into db", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to update usage database")
		return
	}

	// redis operation
	if err := h.rdb.ResetSpend(r.Context(), projectID); err != nil {
		// Log error, but don't fail response since PostgreSQL update succeeded
		logger.Warn("failed to reset spend cache in redis", slog.Any("error", err))
	}

	logger.Info("budget reset succesfully")
	utils.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Successfully reset monthly usage",
	})
}

func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "project id is required")
		return
	}

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	// // Attach contextual fields for structured logging
	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// checking ownership
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.As(err, pgx.ErrNoRows) {
			logger.Warn("delete project failed: project not found")
			utils.WriteError(w, http.StatusNotFound, "project not found")
			return
		}

		logger.Error("failed to fetch project for deletion", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to delete project")
		return
	}

	if project.UserID != userID {
		logger.Warn("unauthorized attempt to delete project", slog.String("owner_id", project.ID))
		utils.WriteError(w, http.StatusForbidden, "you don't have access to this project")
		return
	}

	// delete the project
	err = h.db.Queries.DeleteProject(r.Context(), projectID)
	if err != nil {
		logger.Error("failed to delete project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to delete project")
		return
	}

	logger.Info("project deleted successfully")

	w.WriteHeader(http.StatusNoContent)

}
