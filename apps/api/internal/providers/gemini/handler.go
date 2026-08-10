package gemini

import (
	"bufio"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/JejurkarYash/setu/internal/billing"
	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/proxy"
	"github.com/JejurkarYash/setu/internal/redis"
	"github.com/go-chi/chi"
)

type Handler struct {
	cfg    *config.Config
	logger *slog.Logger
	proxy  *httputil.ReverseProxy
	rdb    *redis.Client
}

// gemini response
type GeminiResponse struct {
	UsageMetadata struct {
		PromptTokenCount     int `json:"promptTokenCount"`
		CandidatesTokenCount int `json:"candidatesTokenCount"`
		TotalTokenCount      int `json:"totalTokenCount"`
	}
}

// gemini handler init
func NewHandler(cfg *config.Config, logger *slog.Logger, rdb *redis.Client) *Handler {
	h := &Handler{
		cfg:    cfg,
		logger: logger,
		rdb:    rdb,
	}

	// getting the newproxy engine
	p := proxy.NewProxyEngine(h, logger)
	h.proxy = p.SetupProxyEngine()

	return h
}

// registering the subroute
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Post("/models/{path...}", h.handleProxyRequest)

	return r
}

// handling the proxy
func (h *Handler) handleProxyRequest(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("gemini request get's hit")
	h.proxy.ServeHTTP(w, r)
}

// getting the provider specific URL
func (h *Handler) TargetURL() string {
	return "https://generativelanguage.googleapis.com"
}

// injecting api key into outgoing request headers
func (h *Handler) InjectAPI(pr *httputil.ProxyRequest) error {

	// for testing -> fetching key from env
	// once the middleware implemented will get the real key from request context
	realKey := h.cfg.Gemini.APIKey
	q := pr.Out.URL.Query()
	q.Del("key")

	pr.Out.URL.RawQuery = q.Encode()
	pr.Out.Header.Set("x-goog-api-key", realKey)
	return nil
}

// update the redis counter
func (h *Handler) UpdateSpend(ctx context.Context, inputToken, outputToken int) error {
	var model string
	var projectID string

	modelName := ctx.Value("modelName")
	project_id := ctx.Value("projectID")

	if modelNameStr, ok := modelName.(string); ok {
		model = modelNameStr
	} else {
		model = "gemini-3.5-flash"
	}

	if projectIDStr, ok := project_id.(string); ok {
		projectID = projectIDStr
	} else {
		projectID = "test:123"
	}

	totalCost := billing.CalculateCost(model, inputToken, outputToken)

	// logging for debug
	h.logger.Info("Calculated request cost ",
		slog.String("model", model),
		slog.Float64("cost", totalCost),
		slog.Int("input_tokens", inputToken),
		slog.Int("output_tokens", outputToken))

	if err := h.rdb.IncrSpend(ctx, model, projectID, totalCost); err != nil {
		h.logger.Error("failed to update redis spend", slog.Any("err", err))
		return err
	}

	return nil
}

// parsing
func (h *Handler) Parser(r io.Reader, contentType string) (int, int, error) {
	if strings.Contains(contentType, "text/event-stream") {
		return h.parseSSEChunks(r)
	}

	return h.parseNonSSEChunks(r)
}

// method for parsing SSE events
func (h *Handler) parseSSEChunks(r io.Reader) (int, int, error) {
	scanner := bufio.NewScanner(r)
	var promptToken, candidateToken int
	for scanner.Scan() {

		line := scanner.Text()

		if strings.HasPrefix(line, "data: ") {

			jsonData := strings.TrimPrefix(line, "data: ")

			var chunk GeminiResponse
			if err := json.Unmarshal([]byte(jsonData), &chunk); err == nil {

				if chunk.UsageMetadata.TotalTokenCount > 0 {

					promptToken = chunk.UsageMetadata.PromptTokenCount
					candidateToken = chunk.UsageMetadata.CandidatesTokenCount
				}
			}

		}
	}
	// if error arises
	if err := scanner.Err(); err != nil {
		return 0, 0, err
	}

	return promptToken, candidateToken, nil

}

// method for parsing nonSEE events
func (h *Handler) parseNonSSEChunks(r io.Reader) (int, int, error) {
	var resp GeminiResponse
	if err := json.NewDecoder(r).Decode(&resp); err != nil {
		return 0, 0, err
	}
	return resp.UsageMetadata.PromptTokenCount,
		resp.UsageMetadata.CandidatesTokenCount, nil
}
