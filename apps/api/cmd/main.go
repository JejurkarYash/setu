package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

type GeminiStreamChunk struct {
	UsageMetadata UsageMetadata `json:"usageMetadata"`
}

type UsageMetadata struct {
	PromptTokenCount     int `json:"promptTokenCount"`
	CandidatesTokenCount int `json:"candidatesTokenCount"`
	TotalTokenCount      int `json:"totalTokenCount"`
	ThoughtsTokenCount   int `json:"thoughtsTokenCount"` // Reasoning tokens!
}

// Custom ReadCloser that closes PipeWriter when the HTTP response body finishes
type bodyWrapper struct {
	io.Reader
	body io.Closer
	pw   *io.PipeWriter
}

func (b *bodyWrapper) Close() error {
	// 1. Close the PipeWriter so io.Copy in the goroutine receives io.EOF
	b.pw.Close()
	// 2. Close the actual HTTP response body
	return b.body.Close()
}

func main() {
	targetURL, _ := url.Parse("https://generativelanguage.googleapis.com")

	proxy := &httputil.ReverseProxy{
		FlushInterval: -1, // Instant streaming flush

		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.Out.URL.Scheme = targetURL.Scheme
			pr.Out.URL.Host = targetURL.Host
			pr.Out.Host = targetURL.Host
			pr.Out.URL.Path = pr.In.URL.Path
			pr.Out.URL.RawQuery = pr.In.URL.RawQuery
			pr.Out.Header.Set("Accept-Encoding", "identity") // Plaintext streaming
		},

		ModifyResponse: func(r *http.Response) error {
			pr, pw := io.Pipe()

			// Wrap r.Body so closing r.Body also closes pw
			r.Body = &bodyWrapper{
				Reader: io.TeeReader(r.Body, pw),
				body:   r.Body,
				pw:     pw,
			}

			// Goroutine captures the intercepted stream in the background
			go func() {
				finalUsage, err := processStreamUsage(pr)
				if err != nil {
					log.Printf("error while reading the response ", err)
					return
				}

				fmt.Println("\n==========================================")
				fmt.Println("📊 SETU FINAL TOKEN USAGE EXTRACTED:")
				fmt.Printf("Input Tokens:      %d\n", finalUsage.PromptTokenCount)
				fmt.Printf("Output Tokens:     %d\n", finalUsage.CandidatesTokenCount)
				fmt.Printf("Reasoning Tokens:  %d\n", finalUsage.ThoughtsTokenCount)
				fmt.Printf("Total Tokens:      %d\n", finalUsage.TotalTokenCount)
				fmt.Println("==========================================")
			}()

			return nil
		},
	}

	mux := http.NewServeMux()
	// gemini
	mux.HandleFunc("POST /v1beta/{path...}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("reach here ")
		proxy.ServeHTTP(w, r)
	})

	fmt.Println("Setu Proxy running on :8080...")
	log.Fatal(http.ListenAndServe(":8080", mux))

}

func processStreamUsage(r io.Reader) (UsageMetadata, error) {
	scanner := bufio.NewScanner(r)
	var finalUsage UsageMetadata

	for scanner.Scan() {
		line := scanner.Text()

		// Filter for Server-Sent Event data lines
		if strings.HasPrefix(line, "data: ") {
			jsonData := strings.TrimPrefix(line, "data: ")

			var chunk GeminiStreamChunk
			if err := json.Unmarshal([]byte(jsonData), &chunk); err == nil {
				// Keep overwriting so we hold the final accurate token count
				if chunk.UsageMetadata.TotalTokenCount > 0 {
					finalUsage = chunk.UsageMetadata
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return finalUsage, err
	}

	return finalUsage, nil
}