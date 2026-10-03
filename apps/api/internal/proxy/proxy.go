package proxy

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/jackc/pgx/v5/pgtype"
)

// provider interface
type Provider interface {
	TargetURL() string                                        // -> url
	InjectAPI(pr *httputil.ProxyRequest) error                // -> injecting the API
	Parser(r io.Reader, contentType string) (int, int, error) // -> reading the input and output tokens

	UpdateSpend(ctx context.Context, inputToken, outputToken int) (string, string, float64, error) // -> update the redis counter
}

type bodyWrapper struct {
	io.Reader
	body io.Closer
	pw   *io.PipeWriter
}

func (b *bodyWrapper) Close() error {
	// close the pipe writer
	b.pw.Close()
	// close the body
	return b.body.Close()
}

// wrapping interface
type Engine struct {
	provider Provider
	Logger   *slog.Logger
	db       *database.Database
}

// proxy init
func NewProxyEngine(p Provider, logger *slog.Logger, db *database.Database) *Engine {
	return &Engine{
		provider: p,
		Logger:   logger,
		db:       db,
	}
}

// setting up the proxy engine
func (e *Engine) SetupProxyEngine() *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		FlushInterval: -1,
		Rewrite: func(pr *httputil.ProxyRequest) { // -> rewriting the outgoing request

			target, _ := url.Parse(e.provider.TargetURL())
			pr.SetURL(target)
			pr.Out.Host = target.Host

			// disabling the compressed
			pr.Out.Header.Set("Accept-Encoding", "identity")
			// injecting provider api key
			e.provider.InjectAPI(pr)
		},

		ModifyResponse: func(r *http.Response) error { // -> modifying the incoming LLM response

			// reading logic comes here
			pr, pw := io.Pipe()

			r.Body = &bodyWrapper{
				Reader: io.TeeReader(r.Body, pw),
				body:   r.Body,
				pw:     pw,
			}

			contentType := r.Header.Get("Content-Type")

			// copying the request context to new context
			// cause our updateSpend runs in the background so after response is send to client
			// it cancel the main reuqqest context
			detachedCtx := context.WithoutCancel(r.Request.Context())

			// run in the background -> spawning a thread
			go func() {

				inputToken, outputToken, err := e.provider.Parser(pr, contentType) // -> llm specific provider
				if err != nil {
					e.Logger.Error("failed to parse tokens", slog.Any("error", err))
				}

				// passing this token to calculate or update the redis part
				projectId, modelName, totalCost, error := e.provider.UpdateSpend(detachedCtx, inputToken, outputToken)

				if error != nil {
					e.Logger.Error("failed to get the data from update spend", slog.Any("err", error))
				}

				// database log -> for analytics purpose
				var projectUUID pgtype.UUID
				if err := projectUUID.Scan(projectId); err != nil {
					e.Logger.Error("failed to parse projectID as UUID", slog.Any("error", err))
				}

				e.db.Queries.InsertUsageLog(detachedCtx, dbgen.InsertUsageLogParams{
					ProjectID:        projectUUID,
					Model:            modelName,
					PromptTokens:     int32(inputToken),
					CompletionTokens: int32(outputToken),
					StatusCode:       200,
					CostUsd:          float64(totalCost),
				})

			}()
			return nil
		},
	}
}
