package project

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

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
	db        *database.Database
	logger    *slog.Logger
	rdb       *redis.Client
	encryptor *utils.Encryptor
}

type CreateProjectRequest struct {
	Name        string   `json:"name"`
	Budget      float64  `json:"monthly_budget"`
	Provider    provider `json:"provider"`
	ProviderKey string   `json:"provider_key"`
}

type provider string

const (
	ProviderOpenAI    provider = "openai"
	ProviderAnthropic provider = "anthropic"
	ProviderGemini    provider = "gemini"
)

// validating method
func (p provider) IsValid() bool {
	switch p {
	case ProviderAnthropic, ProviderGemini, ProviderOpenAI:
		return true
	default:
		return false
	}
}

type CreateProjectResponse struct {
	Id        string  `json:"id"`
	Name      string  `json:"name"`
	Budget    float64 `json:"monthly_budget"`
	Provider  string  `json:"provider"`
	ApiKey    string  `json:"api_key"`
	KeyPrefix string  `json:"key_prefix"`
}

type ListProjectsResponse struct {
	Projects []dbgen.Project `json:"projects"`
}

type ProjectOverviewResponse struct {
	Project        ProjectOverviewProject   `json:"project"`
	Range          ProjectOverviewRange     `json:"range"`
	Summary        ProjectOverviewSummary   `json:"summary"`
	Volume         []ProjectOverviewVolume  `json:"volume"`
	RecentRequests []ProjectOverviewRequest `json:"recent_requests"`
}

type ProjectOverviewProject struct {
	ID                    string  `json:"id"`
	Name                  string  `json:"name"`
	MonthlyBudget         float64 `json:"monthly_budget"`
	Spend                 float64 `json:"spend"`
	Provider              string  `json:"provider"`
	ProxyKeyPrefix        string  `json:"proxy_key_prefix"`
	ProviderKeyConfigured bool    `json:"provider_key_configured"`
}

type ProjectOverviewRange struct {
	From     time.Time `json:"from"`
	To       time.Time `json:"to"`
	Interval string    `json:"interval"`
}

type ProjectOverviewSummary struct {
	TotalRequests      int64   `json:"total_requests"`
	SuccessfulRequests int64   `json:"successful_requests"`
	BlockedRequests    int64   `json:"blocked_requests"`
	PromptTokens       int64   `json:"prompt_tokens"`
	CompletionTokens   int64   `json:"completion_tokens"`
	TotalTokens        int64   `json:"total_tokens"`
	TotalCostUSD       float64 `json:"total_cost_usd"`
}

type ProjectOverviewVolume struct {
	Bucket             time.Time `json:"bucket"`
	TotalRequests      int64     `json:"total_requests"`
	SuccessfulRequests int64     `json:"successful_requests"`
	BlockedRequests    int64     `json:"blocked_requests"`
}

type ProjectOverviewRequest struct {
	ID               string    `json:"id"`
	Model            string    `json:"model"`
	StatusCode       int32     `json:"status_code"`
	PromptTokens     int32     `json:"prompt_tokens"`
	CompletionTokens int32     `json:"completion_tokens"`
	CostUSD          float64   `json:"cost_usd"`
	CreatedAt        time.Time `json:"created_at"`
}

type UpdateProjectResponse struct {
	Project dbgen.Project
}

type UpdateProjectRequest struct {
	Name   string  `json:"name"`
	Budget float64 `json:"monthly_budget"`
}

func NewHandler(db *database.Database, logger *slog.Logger, rdb *redis.Client, encryptor *utils.Encryptor) *Handler {
	return &Handler{
		db:        db,
		logger:    logger,
		rdb:       rdb,
		encryptor: encryptor,
	}
}

// registering routes
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	// registering routes

	// Project Management Routes
	r.Post("/", h.CreateProject)
	r.Get("/", h.ListProjects)
	r.Get("/{id}", h.GetProjectByID)
	r.Patch("/{id}", h.UpdateProject)
	r.Post("/{id}/reset-budget", h.ResetMonthlyBudgetUsage)
	r.Delete("/{id}", h.DeleteProject)

	// API Key Routes
	r.Post("/key/generate/{id}", h.GenerateNewAPIKEY)

	// Analytics & Alert Routes
	r.Get("/{id}/logs", h.GetUsageLogs)
	r.Get("/{id}/overview", h.GetProjectOverview)

	return r

}

// Project Management handler Methods
func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {

	var req CreateProjectRequest
	if err := utils.ReadJSON(r, &req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Bad Request")
		return
	}

	// validating request fields
	if req.Budget == 0 || req.Name == "" || req.Provider == "" || req.ProviderKey == "" {
		utils.WriteError(w, http.StatusBadRequest, "fields are required")
		return
	}

	// validating provider name
	if !req.Provider.IsValid() {
		utils.WriteError(w, http.StatusBadRequest, "Invalid provider")
		return
	}

	// getting userID
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	logger := h.logger.With(
		slog.String("user_id", userID),
	)

	ctx := r.Context()

	// START TRANSACTION
	tx, err := h.db.Pool.Begin(ctx)
	if err != nil {
		logger.Error("failed to create new project: failed to begin new transaction", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	// If anything below returns, rollback.
	defer tx.Rollback(ctx)

	// Create sqlc queries using transaction
	q := h.db.Queries.WithTx(tx)

	// CREATE PROJECT

	params := dbgen.CreateProjectParams{
		Name:          req.Name,
		MonthlyBudget: req.Budget,
		UserID:        userID,
	}

	project, err := q.CreateProject(ctx, params)
	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				logger.Warn("project creation failed: project already exists")
				utils.WriteError(w, http.StatusConflict, "record already exists")
				return
			}
		}

		logger.Error("failed to create project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	//  ENCRYPT + CREATE PROVIDER KEY

	cipherText, nonce, err := h.encryptor.Encrypt(req.ProviderKey)
	if err != nil {
		logger.Error(
			"failed to encrypt provider key",
			slog.Any("err", err),
		)

		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	_, err = q.CreateProviderKey(ctx, dbgen.CreateProviderKeyParams{
		ProjectID:    project.ID,
		Provider:     string(req.Provider),
		EncryptedKey: cipherText,
		Nonce:        nonce,
	})

	if err != nil {
		logger.Error(
			"failed to create provider key",
			slog.Any("err", err),
		)

		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	//  GENERATE SETU API KEY

	apiKey, err := utils.GenerateAPIKey()
	if err != nil {
		logger.Error(
			"failed to generate api key",
			slog.Any("err", err),
		)

		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	// Hash API key before storing
	hash := sha256.Sum256([]byte(apiKey))
	hashedKey := hex.EncodeToString(hash[:])

	//  STORE API KEY HASH

	_, err = q.CreateApiKey(ctx, dbgen.CreateApiKeyParams{
		ProjectID: project.ID,
		KeyHash:   hashedKey,
		KeyPrefix: apiKey[:13],
	})

	if err != nil {
		logger.Error(
			"failed to create api key",
			slog.Any("err", err),
		)

		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	//  COMMIT

	if err := tx.Commit(ctx); err != nil {
		logger.Error(
			"failed to commit project creation",
			slog.Any("err", err),
		)

		utils.WriteError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	logger.Info("project created successfully")

	// Return the plaintext API key ONCE
	utils.WriteJSON(w, http.StatusCreated, CreateProjectResponse{
		Id:        project.ID,
		Name:      project.Name,
		Budget:    project.MonthlyBudget,
		Provider:  string(req.Provider),
		ApiKey:    apiKey,
		KeyPrefix: apiKey[:13],
	})
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

// Project (cache invalidation handler)
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
	_, err = h.db.Queries.ResetSpend(r.Context(), dbgen.ResetSpendParams{
		ID:    projectID,
		Spend: 0.0000000000,
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

	// reset alert notified
	err = h.db.Queries.ResetLastNotifiedAt(r.Context(), projectID)
	if err != nil {
		logger.Error("failed to update spend into db", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to udpate usage database")
		return
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

// API KEY Handler Methods
func (h *Handler) GenerateNewAPIKEY(w http.ResponseWriter, r *http.Request) {

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

	// attaching context to logger
	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// checking ownership
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			logger.Warn("failed to genrate new key: project not found")
			utils.WriteError(w, http.StatusNotFound, "project not found")
			return
		}

		logger.Error("failed to generate new key", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to generate new key")
		return
	}

	if project.UserID != userID {
		logger.Warn("unauthorized attempt to generate new api key", slog.String("owner_id", project.ID))
		utils.WriteError(w, http.StatusForbidden, "you don't have access to this project")
		return
	}

	// TRANSACTION
	tx, err := h.db.Pool.Begin(r.Context())
	if err != nil {
		logger.Error("failed to generate new key: failed to begin trnsaction", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to generate new key")
		return
	}

	//  if one of the openration failed then rollback
	defer tx.Rollback(r.Context())

	q := h.db.Queries.WithTx(tx)

	// get the active key first
	Oldkey, err := q.GetActiveKeyFromProjectID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			logger.Warn("failed to generate new api key: key not found")
			utils.WriteError(w, http.StatusNotFound, "invalid project id")
			return
		}

		logger.Error("failed to generate new api key", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to generate new key")
		return
	}

	// inactive first api key before creting new one
	_, err = q.UpdateApiKeyStatus(r.Context(), dbgen.UpdateApiKeyStatusParams{
		ID:       Oldkey.ID,
		IsActive: false,
	})

	if err != nil {
		logger.Error("failed to generate new key", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to generate key")
		return
	}

	// GENERATE SETU API KEY
	rawKey, err := utils.GenerateAPIKey()
	if err != nil {
		logger.Error(
			"failed to generate api key",
			slog.Any("err", err),
		)

		utils.WriteError(w, http.StatusInternalServerError, "failed to generate new api key")
		return
	}

	// Hash API key before storing
	hash := sha256.Sum256([]byte(rawKey))
	hashedKey := hex.EncodeToString(hash[:])

	// store it into db
	newKey, err := q.CreateApiKey(r.Context(), dbgen.CreateApiKeyParams{
		ProjectID: projectID,
		KeyPrefix: rawKey[:13],
		KeyHash:   hashedKey,
	})
	if err != nil {
		logger.Error("failed to generate key", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to generate new key")
		return
	}

	// commiting transaction
	if err := tx.Commit(r.Context()); err != nil {
		logger.Error(
			"failed to generate api key",
			slog.Any("err", err),
		)

		// cache invalidation
		if err := h.rdb.DeleteKeyMetadata(r.Context(), Oldkey.KeyHash); err != nil {
			logger.Warn("failed to delete old key metadata from redis", slog.Any("err", err))
		}

		utils.WriteError(w, http.StatusInternalServerError, "failed to generate api key")
		return
	}

	logger.Info("api key generated succesfully")

	// Return the plaintext API key ONCE
	utils.WriteJSON(w, http.StatusCreated, map[string]string{
		"id":         projectID,
		"key_prefix": newKey.KeyPrefix,
		"api_key":    rawKey,
	})
	return

}

// Analytics & Alerts Handler Methods
func (h *Handler) GetUsageLogs(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Bad Request")
		return
	}

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}
	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// getting limit and offset
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	//  default values
	limit := 20
	offset := 0

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 20 // default value
	}

	offset, err = strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0 // default value
	}

	// fetching logs
	usageLogs, err := h.db.Queries.ListUsageLogsByProject(r.Context(), dbgen.ListUsageLogsByProjectParams{
		ProjectID: projectID,
		Limit:     int32(limit),
		Offset:    int32(offset),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			logger.Warn("failed to fetch project logs: Logs Not Found")
			utils.WriteError(w, http.StatusNotFound, "No Logs")
			return
		}
		logger.Error("failed to fetch project logs", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project logs")
		return
	}

	// returning logs
	utils.WriteJSON(w, http.StatusOK, map[string][]dbgen.UsageLog{
		"usage_logs": usageLogs,
	})
	return
}

// analytics

func (h *Handler) GetProjectOverview(w http.ResponseWriter, r *http.Request) {
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

	project, err := h.db.Queries.GetProjectByUserIDAndProjectID(
		r.Context(),
		dbgen.GetProjectByUserIDAndProjectIDParams{
			ID:     projectID,
			UserID: userID,
		},
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "project not found")
			return
		}

		logger.Error("failed to fetch project overview", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}

	now := time.Now().UTC()
	from := now.AddDate(0, 0, -30)
	to := now

	if value := r.URL.Query().Get("from"); value != "" {
		parsed, err := time.Parse(time.RFC3339, value)
		if err != nil {
			utils.WriteError(w, http.StatusBadRequest, "invalid from timestamp")
			return
		}
		from = parsed.UTC()
	}
	if value := r.URL.Query().Get("to"); value != "" {
		parsed, err := time.Parse(time.RFC3339, value)
		if err != nil {
			utils.WriteError(w, http.StatusBadRequest, "invalid to timestamp")
			return
		}
		to = parsed.UTC()
	}
	if !from.Before(to) {
		utils.WriteError(w, http.StatusBadRequest, "from must be before to")
		return
	}

	interval := r.URL.Query().Get("interval")
	if interval == "" {
		interval = "hour"
	}
	if interval != "hour" && interval != "day" {
		utils.WriteError(w, http.StatusBadRequest, "interval must be hour or day")
		return
	}

	filters := []string{
		"project_id = $1",
		"created_at >= $2",
		"created_at <= $3",
	}
	filterArgs := []any{projectID, from, to}

	if value := r.URL.Query().Get("status"); value != "" && value != "all" {
		status, err := strconv.Atoi(value)
		if err != nil {
			utils.WriteError(w, http.StatusBadRequest, "invalid status")
			return
		}
		filters = append(filters, fmt.Sprintf("status_code = $%d", len(filterArgs)+1))
		filterArgs = append(filterArgs, status)
	}
	if value := strings.TrimSpace(r.URL.Query().Get("model")); value != "" && value != "all" {
		filters = append(filters, fmt.Sprintf("model = $%d", len(filterArgs)+1))
		filterArgs = append(filterArgs, value)
	}

	whereClause := strings.Join(filters, " AND ")
	intervalExpression := fmt.Sprintf("date_trunc('%s', created_at)", interval)

	var summary ProjectOverviewSummary
	err = h.db.Pool.QueryRow(
		r.Context(),
		fmt.Sprintf(`
				SELECT
					COUNT(*)::bigint,
					COUNT(*) FILTER (WHERE status_code = 200)::bigint,
					COUNT(*) FILTER (WHERE status_code = 429)::bigint,
					COALESCE(SUM(prompt_tokens), 0)::bigint,
					COALESCE(SUM(completion_tokens), 0)::bigint,
					COALESCE(SUM(prompt_tokens + completion_tokens), 0)::bigint,
					COALESCE(SUM(cost_usd), 0)::double precision
				FROM usage_logs
				WHERE %s
			`, whereClause),
		filterArgs...,
	).Scan(
		&summary.TotalRequests,
		&summary.SuccessfulRequests,
		&summary.BlockedRequests,
		&summary.PromptTokens,
		&summary.CompletionTokens,
		&summary.TotalTokens,
		&summary.TotalCostUSD,
	)
	if err != nil {
		logger.Error("failed to fetch project overview summary", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}

	volumeRows, err := h.db.Pool.Query(
		r.Context(),
		fmt.Sprintf(`
				SELECT
					%s AS bucket,
					COUNT(*)::bigint,
					COUNT(*) FILTER (WHERE status_code = 200)::bigint,
					COUNT(*) FILTER (WHERE status_code = 429)::bigint
				FROM usage_logs
				WHERE %s
				GROUP BY bucket
				ORDER BY bucket ASC
			`, intervalExpression, whereClause),
		filterArgs...,
	)
	if err != nil {
		logger.Error("failed to fetch project overview volume", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}
	defer volumeRows.Close()

	volume := make([]ProjectOverviewVolume, 0)
	for volumeRows.Next() {
		var bucket ProjectOverviewVolume
		if err := volumeRows.Scan(
			&bucket.Bucket,
			&bucket.TotalRequests,
			&bucket.SuccessfulRequests,
			&bucket.BlockedRequests,
		); err != nil {
			logger.Error("failed to decode project overview volume", slog.Any("err", err))
			utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
			return
		}
		volume = append(volume, bucket)
	}
	if err := volumeRows.Err(); err != nil {
		logger.Error("failed to iterate project overview volume", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}

	recentRows, err := h.db.Pool.Query(
		r.Context(),
		fmt.Sprintf(`
				SELECT id, model, status_code, prompt_tokens, completion_tokens, cost_usd, created_at
				FROM usage_logs
				WHERE %s
				ORDER BY created_at DESC
				LIMIT 5
			`, whereClause),
		filterArgs...,
	)
	if err != nil {
		logger.Error("failed to fetch recent project requests", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}
	defer recentRows.Close()

	recentRequests := make([]ProjectOverviewRequest, 0)
	for recentRows.Next() {
		var request ProjectOverviewRequest
		if err := recentRows.Scan(
			&request.ID,
			&request.Model,
			&request.StatusCode,
			&request.PromptTokens,
			&request.CompletionTokens,
			&request.CostUSD,
			&request.CreatedAt,
		); err != nil {
			logger.Error("failed to decode recent project request", slog.Any("err", err))
			utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
			return
		}
		recentRequests = append(recentRequests, request)
	}
	if err := recentRows.Err(); err != nil {
		logger.Error("failed to iterate recent project requests", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}

	providerKeys, err := h.db.Queries.ListProviderKeysByProjectID(
		r.Context(),
		projectID,
	)
	if err != nil {
		logger.Error("failed to fetch provider metadata", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}

	provider := ""
	providerKeyConfigured := false
	for _, providerKey := range providerKeys {
		if providerKey.IsActive {
			provider = providerKey.Provider
			providerKeyConfigured = true
			break
		}
	}

	proxyKeyPrefix := ""
	activeKey, err := h.db.Queries.GetActiveKeyFromProjectID(
		r.Context(),
		projectID,
	)
	if err == nil {
		proxyKeyPrefix = activeKey.KeyPrefix
	} else if !errors.Is(err, pgx.ErrNoRows) {
		logger.Error("failed to fetch proxy key metadata", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "failed to fetch project overview")
		return
	}

	utils.WriteJSON(w, http.StatusOK, ProjectOverviewResponse{
		Project: ProjectOverviewProject{
			ID:                    project.ID,
			Name:                  project.Name,
			MonthlyBudget:         project.MonthlyBudget,
			Spend:                 project.Spend,
			Provider:              provider,
			ProxyKeyPrefix:        proxyKeyPrefix,
			ProviderKeyConfigured: providerKeyConfigured,
		},
		Range: ProjectOverviewRange{
			From:     from,
			To:       to,
			Interval: interval,
		},
		Summary:        summary,
		Volume:         volume,
		RecentRequests: recentRequests,
	})
}
