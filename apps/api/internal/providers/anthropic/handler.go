package anthropic

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/JejurkarYash/setu/internal/billing"
	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/middleware"
	"github.com/JejurkarYash/setu/internal/proxy"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/JejurkarYash/setu/internal/telemetry"
	"github.com/go-chi/chi"
)

type Handler struct {
	cfg    *config.Config
	logger *slog.Logger
	proxy  *httputil.ReverseProxy
	rdb    *redis.Client
}

type AnthropicModelName struct {
	Model string
}

// non Streaming
type AnthropicJSONResponse struct {
	Usage struct {
		InputToken  int `json:"input_tokens"`
		OutputToken int `json:"output_tokens"`
	}
}

// Streaming
type AnthropicSSEResponse struct {
	Message struct {
		Usage struct {
			InputToken int `json:"input_tokens"`
		}
	}
	Usage struct {
		OutputToken int `json:"output_tokens"`
	}
}

func NewHandler(cfg *config.Config, logger *slog.Logger, rdb *redis.Client, db *database.Database, batcher *telemetry.Batcher) *Handler {
	h := &Handler{
		cfg:    cfg,
		logger: logger,
		rdb:    rdb,
	}

	// proxy engine init
	proxy := proxy.NewProxyEngine(h, logger, db, batcher)
	h.proxy = proxy.SetupProxyEngine()

	return h
}

func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Post("/v1/*", h.handleProxyRequest)

	return r
}

func (h *Handler) handleProxyRequest(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("Anthropic Request hit")
	// getting the model name from request body
	// reading all bytes from request body
	bodyBytes, _ := io.ReadAll(r.Body)

	// setting request body again
	r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var model AnthropicModelName
	_ = json.Unmarshal(bodyBytes, &model)

	// setting modelname into context (as string)
	ctx := context.WithValue(r.Context(), "modelName", model.Model)
	r = r.WithContext(ctx)

	h.proxy.ServeHTTP(w, r)
}

func (h *Handler) TargetURL() string {
	return "http://localhost:8081" // => testing purpose change it later
}

func (h *Handler) InjectAPI(pr *httputil.ProxyRequest) error {
	var key string

	// getting provider key from middleware or request context
	originalKey, ok := middleware.GetProviderKey(pr.In.Context())

	if ok {
		key = originalKey
	}

	// injecting it into outgoing request
	pr.Out.Header.Set("Authorization", key)
	pr.Out.Header.Set("x-api-key", key)

	return nil
}

// update redis spend
func (h *Handler) UpdateSpend(ctx context.Context, inputToken, outputToken int) (string, string, float64, error) {
	var model string
	var projectID string

	modelName := ctx.Value("modelName")
	project_id, ok := middleware.GetProjectID(ctx)

	if ok {
		projectID = project_id
	}

	if modelNameStr, ok := modelName.(string); ok {
		model = modelNameStr
	} else { // --> else block of for only testing purpose need to replace it later
		model = "claude-fable-5"
	}

	totalCost := billing.CalculateCost(model, inputToken, outputToken)

	// loggin for debug
	h.logger.Info("Calculated request cost",
		slog.String("model", model),
		slog.Float64("cost", totalCost),
		slog.Int("input_tokens", inputToken),
		slog.Int("ouput_tokens", outputToken))

	if err := h.rdb.IncrSpend(ctx, model, projectID, totalCost); err != nil {
		h.logger.Error("failed to update redis spend", slog.Any("err", err))
		return "", "", 0.0, err
	}

	return projectID, model, totalCost, nil
}

// parsing logic
func (h *Handler) Parser(r io.Reader, contentType string) (int, int, error) {
	if strings.Contains(contentType, "application/json") {
		return h.parseJSONResponse(r)
	}
	return h.parseSSEChunks(r)
}

// parsing methods
func (h *Handler) parseSSEChunks(r io.Reader) (int, int, error) {
	scanner := bufio.NewScanner(r)
	var inputToken, outputToekn int

	for scanner.Scan() {
		line := scanner.Text()

		if strings.Contains(line, "usage") {

			jsonData := strings.TrimPrefix(line, "data: ")

			var resp AnthropicSSEResponse
			if err := json.Unmarshal([]byte(jsonData), &resp); err == nil {
				if resp.Message.Usage.InputToken > 0 {
					inputToken = resp.Message.Usage.InputToken
				}
				outputToekn = resp.Usage.OutputToken

			}
		}
	}

	if err := scanner.Err(); err != nil {
		return 0, 0, err
	}

	return inputToken, outputToekn, nil
}

func (h *Handler) parseJSONResponse(r io.Reader) (int, int, error) {
	var resp AnthropicJSONResponse

	if err := json.NewDecoder(r).Decode(&resp); err != nil {
		return 0, 0, err
	}

	return resp.Usage.InputToken, resp.Usage.OutputToken, nil
}
