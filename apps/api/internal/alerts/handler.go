package alerts

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type Handler struct {
	db        *database.Database
	logger    *slog.Logger
	encryptor *utils.Encryptor
}

// TYPES

type CreateAlertConfigRequest struct {
	ProjectID        string `json:"project_id"`
	TriggerThreshold int32  `json:"trigger_threshold"`
	NotifySlack      bool   `json:"notify_slack"`
	SlackWebHookURL  string `json:"slack_webhook_url"`
}

type UpdateAlertConfigRequest struct {
	NotifySlack      *bool   `json:"notify_slack"`
	TriggerThreshold *int32  `json:"trigger_threshold"`
	SlackWebhookURL  *string `json:"slack_webhook_url"`
}

func NewHandler(db *database.Database, logger *slog.Logger, encryptor *utils.Encryptor) *Handler {
	return &Handler{
		db:        db,
		logger:    logger,
		encryptor: encryptor,
	}
}

// routes
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	// registering routes
	r.Post("/{id}", h.CreateAlertConfig)
	r.Get("/{id}", h.GetAlertConfig)
	r.Patch("/{id}", h.UpdateAlertConfig)
	r.Delete("/{id}", h.DeleteAlertConfig)

	return r
}

// methods
func (h *Handler) CreateAlertConfig(w http.ResponseWriter, r *http.Request) {

	// extracting userID first
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}

	// extracting projectID
	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "project id is required")
		return
	}

	// attaching context to logger
	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// ownership check
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			logger.Warn("CreateAlertConfig Failed: No Project Found")
			utils.WriteError(w, http.StatusNotFound, "Failed to Create Alert: No Project Found")
			return
		}

		logger.Error("CreateAlertConfig Failed:", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to create Alert")
		return
	}

	if project.UserID != userID {
		logger.Warn("Unauthorized Attempt to Create Alert", slog.String("owner_id", project.UserID))
		utils.WriteError(w, http.StatusForbidden, "Don't have access to project")
		return
	}

	// extracting body from request

	var reqBody CreateAlertConfigRequest
	err = utils.ReadJSON(r, &reqBody)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Bad Request")
		return
	}

	threshold := reqBody.TriggerThreshold

	if threshold == 0 {
		threshold = 80
	}

	if threshold < 1 || threshold > 100 {
		utils.WriteError(
			w,
			http.StatusBadRequest,
			"Trigger threshold must be between 1 and 100",
		)
		return
	}

	var cipherText, nonce []byte

	if reqBody.NotifySlack {
		if strings.TrimSpace(reqBody.SlackWebHookURL) == "" {
			utils.WriteError(
				w,
				http.StatusBadRequest,
				"Slack webhook URL is required when Slack notifications are enabled",
			)
			return
		}

		cipherText, nonce, err = h.encryptor.Encrypt(
			reqBody.SlackWebHookURL,
		)
		if err != nil {
			logger.Error(
				"failed to encrypt Slack webhook URL",
				slog.Any("err", err),
			)
			utils.WriteError(
				w,
				http.StatusInternalServerError,
				"Failed to create alert configuration",
			)
			return
		}
	}

	// creating alert
	alert, err := h.db.Queries.CreateAlertConfig(r.Context(), dbgen.CreateAlertConfigParams{
		ProjectID:                projectID,
		TriggerThresholdPct:      threshold,
		NotifySlack:              reqBody.NotifySlack,
		SlackWebhookUrlEncrypted: cipherText,
		SlackWebhookNonce:        nonce,
	})
	var pgErr *pgconn.PgError
	if err != nil {
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23503" {
				logger.Error("failed to create alert config", slog.Any("err", err))
				utils.WriteError(w, http.StatusConflict, "Alert Configuaration Already Exist")
				return
			}
		}
		logger.Error("CreateAlertConfig Failed", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to Create Alert Config")
		return
	}

	logger.Info("Alert Created Succesfully")

	utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"id":                    alert.ID,
		"project_id":            alert.ProjectID,
		"notify_slack":          alert.NotifySlack,
		"trigger_threshold_pct": alert.TriggerThresholdPct,
		"last_notified_at":      alert.LastNotifiedAt,
		"created_at":            alert.CreatedAt,
		"updated_at":            alert.UpdatedAt,
	})

}

// GetAlertConfig retrieves a project's alert configuration.
func (h *Handler) GetAlertConfig(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Project ID is required")
		return
	}

	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}

		logger.Error("failed to get project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get alert configuration")
		return
	}

	if project.UserID != userID {
		utils.WriteError(w, http.StatusForbidden, "Don't have access to project")
		return
	}

	alert, err := h.db.Queries.GetAlertConfigByProjectID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "Alert configuration not found")
			return
		}

		logger.Error("failed to get alert configuration", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get alert configuration")
		return
	}

	// Never expose the encrypted webhook or nonce.
	response := map[string]interface{}{
		"id":                    alert.ID,
		"project_id":            alert.ProjectID,
		"notify_slack":          alert.NotifySlack,
		"trigger_threshold_pct": alert.TriggerThresholdPct,
		"last_notified_at":      alert.LastNotifiedAt,
		"created_at":            alert.CreatedAt,
		"updated_at":            alert.UpdatedAt,
	}

	utils.WriteJSON(w, http.StatusOK, response)
}

// UpdateAlertConfig updates an existing alert configuration.
func (h *Handler) UpdateAlertConfig(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Project ID is required")
		return
	}

	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// Verify project ownership.
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}

		logger.Error("failed to get project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to update alert configuration")
		return
	}

	if project.UserID != userID {
		utils.WriteError(w, http.StatusForbidden, "Don't have access to project")
		return
	}

	// Read PATCH body.
	var reqBody UpdateAlertConfigRequest
	if err := utils.ReadJSON(r, &reqBody); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Fetch existing configuration.
	alert, err := h.db.Queries.GetAlertConfigByProjectID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "Alert configuration not found")
			return
		}

		logger.Error("failed to get alert configuration", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to update alert configuration")
		return
	}

	// Preserve existing values when fields are omitted.
	threshold := alert.TriggerThresholdPct
	notifySlack := alert.NotifySlack
	cipherText := append([]byte(nil), alert.SlackWebhookUrlEncrypted...)
	nonce := append([]byte(nil), alert.SlackWebhookNonce...)

	if reqBody.TriggerThreshold != nil {
		threshold = *reqBody.TriggerThreshold
	}

	if threshold < 1 || threshold > 100 {
		utils.WriteError(
			w,
			http.StatusBadRequest,
			"Trigger threshold must be between 1 and 100",
		)
		return
	}

	if reqBody.NotifySlack != nil {
		notifySlack = *reqBody.NotifySlack
	}

	// Replace the webhook only when a new URL is supplied.
	if reqBody.SlackWebhookURL != nil {
		webhookURL := strings.TrimSpace(*reqBody.SlackWebhookURL)
		if webhookURL == "" {
			utils.WriteError(w, http.StatusBadRequest, "Slack webhook URL cannot be empty")
			return
		}

		// Encryption
		cipherText, nonce, err = h.encryptor.Encrypt(webhookURL)
		if err != nil {
			logger.Error("failed to encrypt Slack webhook", slog.Any("err", err))
			utils.WriteError(w, http.StatusInternalServerError, "Failed to update alert configuration")
			return
		}
	}

	// Enabling requires a previously saved or newly supplied webhook.
	if notifySlack && len(cipherText) == 0 {
		utils.WriteError(
			w,
			http.StatusBadRequest,
			"A Slack webhook URL is required to enable notifications",
		)
		return
	}

	updatedAlert, err := h.db.Queries.UpdateAlertConfig(
		r.Context(),
		dbgen.UpdateAlertConfigParams{
			ProjectID:                projectID,
			TriggerThresholdPct:      threshold,
			NotifySlack:              notifySlack,
			SlackWebhookUrlEncrypted: cipherText,
			SlackWebhookNonce:        nonce,
		},
	)
	if err != nil {
		logger.Error("failed to update alert configuration", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to update alert configuration")
		return
	}

	logger.Info("alert configuration updated successfully")

	// Do not return encrypted secret material.
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"id":                    updatedAlert.ID,
		"project_id":            updatedAlert.ProjectID,
		"notify_slack":          updatedAlert.NotifySlack,
		"trigger_threshold_pct": updatedAlert.TriggerThresholdPct,
		"last_notified_at":      updatedAlert.LastNotifiedAt,
		"created_at":            updatedAlert.CreatedAt,
		"updated_at":            updatedAlert.UpdatedAt,
	})
}

// DeleteAlertConfig deletes a project's alert configuration.
func (h *Handler) DeleteAlertConfig(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid Token")
		return
	}

	projectID := chi.URLParam(r, "id")
	if projectID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Project ID is required")
		return
	}

	logger := h.logger.With(
		slog.String("user_id", userID),
		slog.String("project_id", projectID),
	)

	// Verify project ownership.
	project, err := h.db.Queries.GetProjectByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}

		logger.Error("failed to get project", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to delete alert configuration")
		return
	}

	if project.UserID != userID {
		utils.WriteError(w, http.StatusForbidden, "Don't have access to project")
		return
	}

	// Ensure an alert configuration exists.
	_, err = h.db.Queries.GetAlertConfigByProjectID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.WriteError(w, http.StatusNotFound, "Alert configuration not found")
			return
		}

		logger.Error("failed to get alert configuration", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to delete alert configuration")
		return
	}

	// Delete the configuration.
	err = h.db.Queries.DeleteAlertConfig(r.Context(), projectID)
	if err != nil {
		logger.Error("failed to delete alert configuration", slog.Any("err", err))
		utils.WriteError(w, http.StatusInternalServerError, "Failed to delete alert configuration")
		return
	}

	logger.Info("alert configuration deleted successfully")
	w.WriteHeader(http.StatusNoContent)
}
