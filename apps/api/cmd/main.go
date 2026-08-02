package main

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

const geminiBaseURL = "https://generativelanguage.googleapis.com"

func main() {
	fmt.Println("welcome to setu")

	targetURL, err := url.Parse(geminiBaseURL)
	if err != nil {
		log.Fatal("Error parsing URL: ", err)
	}

	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			// 1. Set scheme & host to generativelanguage.googleapis.com
			pr.Out.URL.Scheme = targetURL.Scheme
			pr.Out.URL.Host = targetURL.Host
			pr.Out.Host = targetURL.Host

			// 2. Preserve original request Path & Query Params (e.g. ?key=...)
			pr.Out.URL.Path = pr.In.URL.Path
			pr.Out.URL.RawQuery = pr.In.URL.RawQuery
		},

		ModifyResponse: func(r *http.Response) error {
			var reader io.Reader = r.Body

			// Handle gzip decompression if Gemini returns compressed data
			if strings.EqualFold(r.Header.Get("Content-Encoding"), "gzip") {
				gzReader, err := gzip.NewReader(r.Body)
				if err != nil {
					return err
				}
				defer gzReader.Close()
				reader = gzReader
			}

			body, err := io.ReadAll(reader)
			if err != nil {
				return err
			}

			fmt.Println("\n--- GEMINI RESPONSE RECEIVED ---")
			fmt.Println(string(body))

			// Restore body for the JS client
			r.Body = io.NopCloser(bytes.NewReader(body))
			r.Header.Del("Content-Encoding")
			r.ContentLength = int64(len(body))

			return nil
		},
	}

	mux := http.NewServeMux()

	// Wildcard route matching without trailing slash issues (Go 1.22+ wildcard format)
	mux.HandleFunc("POST /v1beta/{path...}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Incoming request: %s %s (Content-Length: %d)\n", r.Method, r.URL.Path, r.ContentLength)
		proxy.ServeHTTP(w, r)
	})

	srv := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	fmt.Println("HTTP server listening on port :8080")
	log.Fatal(srv.ListenAndServe())
}