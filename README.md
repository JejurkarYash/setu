# Setu 🌉
A high-throughput, low-latency, budget-protected Go-native LLM API Gateway. 

Setu sits between client applications and downstream LLM providers (Gemini, OpenAI, Anthropic). It handles requests rewrite routing, intercepts streaming responses asynchronously for zero-copy token usage parsing, tracks spending in Redis, and enforces budget circuit breakers.

---

## 🏗️ Architecture Design

Setu is built with performance and memory efficiency as first-class citizens, avoiding heavy buffering that crashes servers under load.

### 1. Zero-Copy Streaming Interception
To log token counts and billing info, gateways usually buffer response bodies in memory. Setu avoids this completely using Go standard library primitives:
- **`io.TeeReader`**: Clones the response payload on-the-fly as bytes stream to the client.
- **`io.Pipe`**: Writes the cloned bytes stream asynchronously into a concurrent background parser.
- **Goroutine Decoupling**: Parsing runs completely asynchronously, ensuring zero impact on user-facing streaming latency.

```text
                  ┌──────────────────────────────┐
                  │      Client Connection       │
                  └──────────────▲───────────────┘
                                 │ (Reads stream)
                        ┌────────┴────────┐
                        │  io.TeeReader   │
                        └────────▲────────┘
                                 │
                         [ Reverse Proxy ]
                                 │
                     (Incoming Bytes from LLM)
                                 │
                                 ├─────────────────────────┐
                                 │ (Asynchronous Write)    │
                                 ▼                         ▼
                           [ io.PipeWriter ]        [ Client Stream ]
                                 │
                                 ▼
                           [ io.PipeReader ]
                                 │
                                 ▼
                         [ Token Parser ] (Background Goroutine)
                                 │
                                 ▼
                         [ Spend Logger ] (Redis Update)
```

### 2. Provider Namespacing
To avoid route collision between multiple providers who use the same path suffixes (e.g., `/v1/chat/completions`), Setu isolates providers under specific routing namespaces:
- **OpenAI:** `/openai/v1/*`
- **Anthropic:** `/anthropic/v1/*`
- **Gemini:** `/gemini/v1beta/*`

---

## 🚀 Features Built So Far

- **Generic Proxy Engine:** Configured reverse proxy with latency flush controls and accept-encoding overrides.
- **Async Token Parsing:** Lightweight line-by-line streaming scanners for:
  - **Gemini** (SSE streams and Unary JSON)
  - **OpenAI** (SSE streams and Unary JSON)
  - **Anthropic** (Accumulative multi-chunk message starts & deltas)
- **Redis Spend Counter:** Custom encapsulated Redis wrapper utilizing `context.WithoutCancel` to securely increment project spend metrics after the main request context has closed.
- **In-Memory Billing Engine:** Pre-compiled database pricing map covering the rates of active major LLM models.

---

## 📂 Project Structure

```text
├── apps/
│   └── api/                  # Main Go application
│       ├── cmd/
│       │   └── setu/         # App entry point (main.go)
│       └── internal/
│           ├── billing/      # Pricing maps and cost calculations
│           ├── config/       # Koanf configuration loader
│           ├── database/     # PostgreSQL client connection pool (WIP)
│           ├── providers/    # Provider-specific endpoint rewrites & parsers
│           │   ├── anthropic/
│           │   ├── gemini/
│           │   └── openai/
│           ├── proxy/        # Core Reverse Proxy & TeeReader pipeline
│           ├── redis/        # Encapsulated Redis connection & methods
│           ├── router/       # Router multiplexer (Chi router mounts)
│           └── server/       # HTTP Server orchestration & graceful shutdowns
├── docker-compose.yml        # Development environment (Redis, Postgres)
├── test/                     # Mock servers and Javascript client tests
└── README.md
```

---

## 🛠️ How to Run Locally

### 1. Spin up Infrastructure
Start Redis and PostgreSQL containers in the background:
```bash
docker compose up -d
```

### 2. Configure Environment
Create a `.env` file in `apps/api/` (see template in `apps/api/.env`):
```env
SETU_PRIMARY.ENV="local"
SETU_PRIMARY.LOGGERLEVEL="debug"

SETU_SERVER.PORT=8080
SETU_REDIS.ADDRESS="localhost:6379"

# Downstream credentials
SETU_GEMINI.APIKEY="your-gemini-key"
```

### 3. Start Mock Server (For Testing)
To test OpenAI and Anthropic integrations without spending money on real keys, start the local mock streaming server:
```bash
cd test
node server.js
```

### 4. Run Setu Gateway
In the root directory, start the Go server:
```bash
cd apps/api
go run cmd/setu/main.go
# Or if you have task installed:
task run
```

### 5. Send Test Requests
Send a namespaced request to the gateway. Setu will proxy the request, stream the response to you, parse the usage metadata, calculate the cost, and update Redis:

**OpenAI Endpoint:**
```bash
curl -X POST http://localhost:8080/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}], "stream": true}'
```

**Anthropic Endpoint:**
```bash
curl -X POST http://localhost:8080/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 1024, "messages": [{"role": "user", "content": "Hello"}]}'
```
