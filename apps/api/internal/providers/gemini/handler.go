package gemini

import (
	"bufio"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/proxy"
	"github.com/go-chi/chi"
)

type Handler struct {
	cfg    *config.Config
	logger *slog.Logger
	proxy  *httputil.ReverseProxy
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
func NewHandler(cfg *config.Config, logger *slog.Logger) *Handler {
	h := &Handler{
		cfg:    cfg,
		logger: logger,
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
