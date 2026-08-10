package proxy

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// provider interface
type Provider interface {
	TargetURL() string                                        // -> url
	InjectAPI(pr *httputil.ProxyRequest) error                // -> injecting the API
	Parser(r io.Reader, contentType string) (int, int, error) // -> reading the input and output tokens

	UpdateSpend(ctx context.Context, inputToken, outputToken int) error // -> update the redis counter
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
}

// proxy init
func NewProxyEngine(p Provider, logger *slog.Logger) *Engine {
	return &Engine{
		provider: p,
		Logger:   logger,
	}
}

// setting up the proxy engine
func (e *Engine) SetupProxyEngine() *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		FlushInterval: -1,
		Rewrite: func(pr *httputil.ProxyRequest) {

			target, _ := url.Parse(e.provider.TargetURL())
			pr.SetURL(target)
			pr.Out.Host = target.Host

			// disabling the compressed
			pr.Out.Header.Set("Accept-Encoding", "identity")
			// injecting api
			e.provider.InjectAPI(pr)
		},

		ModifyResponse: func(r *http.Response) error {
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

			// run in the background
			go func() {

				inputToken, outputToken, err := e.provider.Parser(pr, contentType) // -> llm specific provider
				if err != nil {
					e.Logger.Error("failed to parse tokens", slog.Any("error", err))
				}

				// passing this token to calculate or update the redis part
				e.provider.UpdateSpend(detachedCtx, inputToken, outputToken)
			}()
			return nil
		},
	}
}
