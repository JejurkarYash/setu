package openai

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

type OpenAIStreamResponse struct {
	Response struct {
		Usage struct {
			InputToken  int `json:"input_tokens"`
			OutputToken int `json:"output_tokens"`
			TotalToken  int `json:"total_tokens"`
		}
	}
}

type OpenAIJSONResponse struct {
	Usage struct {
		InputToken  int `json:"input_tokens"`
		OutputToken int `json:"output_tokens"`
		TotalToken  int `json:"total_tokens"`
	}
}

// openai handler init
func NewHandler(cfg *config.Config, logger *slog.Logger) *Handler {
	h := &Handler{
		cfg:    cfg,
		logger: logger,
	}

	proxy := proxy.NewProxyEngine(h, logger)
	h.proxy = proxy.SetupProxyEngine()

	return h
}

// registering the sub-router
func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Post("/chat/completions", h.handleProxyRequest)
	return r
}

func (h *Handler) handleProxyRequest(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("open ai route hit")
	// serving the request
	h.proxy.ServeHTTP(w, r)
}

// interface methods
func (h *Handler) TargetURL() string {
	return "http://localhost:8081"
}

func (h *Handler) InjectAPI(pr *httputil.ProxyRequest) error {
	return nil
}

// parsing the response based on response content type
func (h *Handler) Parser(r io.Reader, contentType string) (int, int, error) {
	if strings.Contains(contentType, "application/json") {
		return h.parseJSONResponse(r)
	}
	return h.parseSSEChunks(r)
}

// parser methods
// parsing the stream response
func (h *Handler) parseSSEChunks(r io.Reader) (int, int, error) {
	// creating scanner
	scanner := bufio.NewScanner(r)
	var inputToken, outputToken int

	for scanner.Scan() {
		line := scanner.Text()

		if strings.Contains(line, "usage") {

			jsonData := strings.TrimPrefix(line, "data: ")
			var chunk OpenAIStreamResponse

			if err := json.Unmarshal([]byte(jsonData), &chunk); err == nil {

				// total token count should greater than 0
				if chunk.Response.Usage.TotalToken > 0 {
					inputToken = chunk.Response.Usage.InputToken
					outputToken = chunk.Response.Usage.OutputToken
				}

			}
		}
	}

	if err := scanner.Err(); err != nil {
		return 0, 0, err
	}

	return inputToken, outputToken, nil
}

// parsing the non stream response
func (h *Handler) parseJSONResponse(r io.Reader) (int, int, error) {
	var resp OpenAIJSONResponse
	if err := json.NewDecoder(r).Decode(&resp); err != nil {
		return 0, 0, err
	}

	return resp.Usage.InputToken, resp.Usage.OutputToken, nil
}
