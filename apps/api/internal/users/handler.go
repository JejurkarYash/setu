package users

import (
	"errors"
	"log/slog"
	"net/http"
	"os"

	"cloud.google.com/go/auth/credentials/idtoken"
	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/go-chi/chi"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type Handler struct {
	db     *database.Database
	logger *slog.Logger
	// logger
}

type GoogleAuthRequest struct {
	IDToken string `json:"id_token"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  *dbgen.User `json:"user"`
}

func NewHandler(db *database.Database, logger *slog.Logger) *Handler {
	return &Handler{
		db:     db,
		logger: logger,
	}
}

// registering users routes
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	// register routes here
	r.Post("/google", h.CreateUser)
	return r
}

// handler methods
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {

	var req GoogleAuthRequest
	if err := utils.ReadJSON(r, &req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid Request Body")
		return
	}

	if req.IDToken == "" {
		utils.WriteError(w, http.StatusBadRequest, "id_token is required")
		return
	}

	// development testing
	var googleID, email, name, avtarURL string
	if os.Getenv("ENV") == "development" && req.IDToken == "mock_token" {

		googleID = "google_user_mock_123"
		email = "runeshkakad@gmail.com"
		name = "Runesh Kakad"
		avtarURL = "htts://lh3.googleusercontent.com/a/default-user"

	} else {

		googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
		payload, err := idtoken.Validate(r.Context(), req.IDToken, googleClientID)
		if err != nil {
			utils.WriteError(w, http.StatusUnauthorized, "Invalid or Expired Google Token")
			return
		}

		googleID = payload.Subject
		email, _ = payload.Claims["email"].(string)
		name, _ = payload.Claims["name"].(string)
		avtarURL, _ = payload.Claims["picture"].(string)

	}

	var avtarURLText pgtype.Text
	_ = avtarURLText.Scan(avtarURL)

	// check if user exist or not
	user, err := h.db.Queries.GetUserByGoogleID(r.Context(), googleID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) { // -> user not present

			// Storing in DB (creating new user )
			user, err = h.db.Queries.CreateUser(r.Context(), dbgen.CreateUserParams{
				GoogleID:  googleID,
				Email:     email,
				Name:      name,
				AvatarUrl: avtarURLText,
			})

			if err != nil {
				utils.WriteError(w, http.StatusInternalServerError, "failed to create user")
				return
			}

		} else { // -> real database issue
			utils.WriteError(w, http.StatusInternalServerError, "database query failed")
			return
		}
	}

	// signing a JWT Token
	JWTToken, err := utils.GenerateJWT(user.ID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to create JWT")
		return
	}

	// logging (debug)
	h.logger.Info("user authenticated successfully",
		"user_id", user.ID,
		"name", user.Name,
		"email", user.Email,
	)

	// returning response
	utils.WriteJSON(w, http.StatusOK, AuthResponse{
		Token: JWTToken,
		User:  &user,
	})
	return

}
