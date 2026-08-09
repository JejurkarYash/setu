package anthropic

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

func NewHandler(cfg *config.Config, logger *slog.Logger) *Handler {
	h := &Handler{
		cfg:    cfg,
		logger: logger,
	}
	proxy := proxy.NewProxyEngine(h, logger)
	h.proxy = proxy.SetupProxyEngine()

	return h
}

func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	r.Post("/v1/{path...}", h.handleProxyRequest)

	return r
}

func (h *Handler) handleProxyRequest(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("Anthropic Request hit")
	h.proxy.ServeHTTP(w, r)
}

func (h *Handler) TargetURL() string {
	return "http://localhost:8081" // => testing purpose change it later
}

func (h *Handler) InjectAPI(pr *httputil.ProxyRequest) error {

	return nil
}

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
