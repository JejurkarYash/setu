# Setu 🌉

A high-throughput, low-latency, budget-protected Go-native LLM API
Gateway.

Setu sits between client applications and downstream LLM providers
(Gemini, OpenAI, Anthropic). It handles request rewriting and routing,
intercepts streaming responses asynchronously for token usage parsing,
tracks spending in Redis, and enforces budget circuit breakers.

---

## 🏗️ Architecture Design

Setu is built with performance and memory efficiency as first-class
citizens, avoiding full-response buffering that can hurt servers under
load.

### 1. Zero-Copy Streaming Interception

To log token counts and billing information, gateways often buffer
response bodies in memory. Setu avoids full-response buffering using Go
standard library primitives:

- **`io.TeeReader`**: Copies the response stream on-the-fly as bytes
  are read by the client.
- **`io.Pipe`**: Sends the copied byte stream to a concurrent
  background parser.
- **Goroutine decoupling**: Parsing runs asynchronously so token
  parsing does not need to block the main response path.

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

To avoid route collisions between providers that share path suffixes
(such as `/v1/chat/completions`), Setu isolates providers under specific
namespaces:

- **OpenAI:** `/openai/v1/*`
- **Anthropic:** `/anthropic/v1/*`
- **Gemini:** `/gemini/v1beta/*`

---

## 🚀 Features Built So Far

- **Generic Proxy Engine:** Reverse proxy configured with latency
  flush controls and `Accept-Encoding` overrides.
- **Async Token Parsing:** Lightweight line-by-line stream scanners
  for:
  - **Gemini:** SSE streams and unary JSON
  - **OpenAI:** SSE streams and unary JSON
  - **Anthropic:** Accumulative multi-chunk message starts and
    deltas
- **Redis Spend Counter:** Encapsulated Redis wrapper using
  `context.WithoutCancel` to increment project spend metrics after the
  main request context has closed.
- **In-Memory Billing Engine:** Precompiled pricing map for supported
  major LLM models.

---

## 📊 Load Testing & Benchmark Results

**Test dates:** October 16--17, 2026\
**Tool:** Grafana k6, with results streamed to Grafana Cloud\
**Execution:** Local execution on macOS\
**Upstream:** Local Node.js mock LLM provider (not a real OpenAI or
Anthropic API)

> **Important:** These results measure Setu against a mock provider in
> the tested local environment. They are not production-capacity claims
> or measurements of real LLM provider latency. Results can vary with
> machine load and test conditions.

### Results Summary

---

          \# Workload        Requests   Throughput        Avg        p95       HTTP
                                                      latency    latency   failures

---

           1 Smoke test:           10       230.06    3.83 ms   15.10 ms         0%
             10                            req/s\*
             iterations

           2 Docker: 10        49,528     1,650.45    5.94 ms   12.45 ms     21.33%
             VUs, 30 sec                     req/s

           3 macOS: 10         68,241     2,274.46    4.29 ms    9.42 ms      1.25%
             VUs, 30 sec                     req/s

           4 macOS: 10        134,190     4,472.70    2.14 ms    3.15 ms         0%
             VUs, 30 sec                     req/s

           5 macOS: 10        247,762     4,129.27    2.32 ms    3.48 ms         0%
             VUs, 60 sec                     req/s

           6 macOS: 10        288,478     4,807.80    1.98 ms    3.06 ms         0%
             VUs, 60 sec,                    req/s
             after
             telemetry
             batcher
             changes

           7 macOS: 20        445,243     7,420.48    2.63 ms    3.88 ms         0%
             VUs, 60 sec                     req/s

           8 macOS: 50        429,748     7,161.84    6.91 ms   10.24 ms         0%
             VUs, 60 sec                     req/s

           9 macOS: 10      1,550,876     5,169.55    1.85 ms    2.88 ms         0%
             VUs, 5 min                      req/s

---

\*The smoke test had only 10 requests, so its calculated throughput is
not a meaningful sustained-capacity measurement.

### Individual Test Notes

#### Test 1 --- Initial Smoke Test

- **Workload:** 10 iterations
- **Requests:** 10
- **Average latency:** 3.83 ms
- **p50 latency:** 1.30 ms
- **p95 latency:** 15.10 ms
- **HTTP failures:** 0%
- **Checks:** 20/20 passed

**Outcome:** Confirmed the basic request flow. Too small to establish
capacity.

#### Test 2 --- Docker-Based Load Test

- **Workload:** 10 VUs for 30 seconds
- **Requests:** 49,528
- **Throughput:** 1,650.45 req/s
- **Average latency:** 5.94 ms
- **p95 latency:** 12.45 ms
- **HTTP failures:** 21.33% (10,565 requests)

**Issue observed:** Setu logged `connect: connection refused` while
connecting to the mock provider through the host gateway address
`192.168.65.254:8081`.

**Outcome:** Failed benchmark. The upstream connection issue needed
investigation.

#### Test 3 --- Early macOS Test

- **Workload:** 10 VUs for 30 seconds
- **Requests:** 68,241
- **Throughput:** 2,274.46 req/s
- **Average latency:** 4.29 ms
- **p95 latency:** 9.42 ms
- **HTTP failures:** 1.25% (857 requests)

**Issues observed:**

- Intermittent upstream errors:
  `connect: resource temporarily unavailable`
- Telemetry warning: `usage event buffer full, dropping telemetry log`

**Outcome:** Improved over the Docker run, but still had failures and
telemetry drops.

#### Test 4 --- First Clean 30-Second Run

- **Workload:** 10 VUs for 30 seconds
- **Requests:** 134,190
- **Throughput:** 4,472.70 req/s
- **Average latency:** 2.14 ms
- **p95 latency:** 3.15 ms
- **HTTP failures:** 0%

**Outcome:** First clean high-throughput run.

#### Test 5 --- Clean 60-Second Run

- **Workload:** 10 VUs for 60 seconds
- **Requests:** 247,762
- **Throughput:** 4,129.27 req/s
- **Average latency:** 2.32 ms
- **p95 latency:** 3.48 ms
- **Maximum latency:** 63.10 ms
- **HTTP failures:** 0%

**Outcome:** Successful one-minute run.

#### Test 6 --- 60-Second Run After Telemetry Batcher Changes

- **Workload:** 10 VUs for 60 seconds
- **Requests:** 288,478
- **Throughput:** 4,807.80 req/s
- **Average latency:** 1.98 ms
- **p95 latency:** 3.06 ms
- **Maximum latency:** 46.90 ms
- **HTTP failures:** 0%

**Additional verification:**

- No telemetry buffer-drop warnings were observed in the checked logs.
- Project data was successfully fetched.
- Usage records were found in PostgreSQL.
- An exact one-to-one reconciliation between all requests and
  persisted usage records was not performed.

**Outcome:** Successful benchmark after telemetry batcher changes.

#### Test 7 --- 20 Virtual Users

- **Workload:** 20 VUs for 60 seconds
- **Requests:** 445,243
- **Throughput:** 7,420.48 req/s
- **Average latency:** 2.63 ms
- **Median latency:** 2.48 ms
- **p90 latency:** 3.43 ms
- **p95 latency:** 3.88 ms
- **Maximum latency:** 65.28 ms
- **HTTP failures:** 0%
- **Checks:** 890,486/890,486 passed

**Outcome:** Successful one-minute, 20-VU benchmark.

#### Test 8 --- 50 Virtual Users

- **Workload:** 50 VUs for 60 seconds
- **Requests:** 429,748
- **Throughput:** 7,161.84 req/s
- **Average latency:** 6.91 ms
- **Median latency:** 6.60 ms
- **p90 latency:** 9.11 ms
- **p95 latency:** 10.24 ms
- **Maximum latency:** 113.33 ms
- **HTTP failures:** 0%
- **Checks:** 859,496/859,496 passed

**Outcome:** Successful one-minute, 50-VU benchmark. Throughput did not
increase over the 20-VU run, while latency increased.

#### Test 9 --- Five-Minute Stability Test

- **Workload:** 10 VUs for 5 minutes
- **Requests:** 1,550,876
- **Throughput:** 5,169.55 req/s
- **Average latency:** 1.85 ms
- **Median latency:** 1.73 ms
- **p90 latency:** 2.52 ms
- **p95 latency:** 2.88 ms
- **Maximum latency:** 79.91 ms
- **HTTP failures:** 0%
- **Checks:** 3,101,752/3,101,752 passed
- **Data received:** 751 MB
- **Data sent:** 503 MB

**Additional verification:** After the run, logs and database
persistence were checked. No relevant warnings or errors were reported,
and usage records were present in PostgreSQL. Exact per-request
persistence reconciliation was not performed.

**Outcome:** Successful five-minute run with zero HTTP failures.

### Key Observations

- **Highest observed throughput:** 7,420.48 req/s at 20 VUs for 60
  seconds.
- **Longest successful run:** 5 minutes at 10 VUs.
- **Five-minute result:** 5,169.55 req/s, 2.88 ms p95 latency, and 0%
  HTTP failures.
- **Highest tested concurrency with zero HTTP failures:** 50 VUs for
  60 seconds.
- After telemetry batcher changes, no buffer-drop warnings were
  observed in checked logs, and usage records were confirmed present
  in PostgreSQL.
- The 20-VU, 50-VU, and five-minute tests were separate runs and
  should not be treated as a controlled scaling curve.

### Limitations and Reproducibility

- The upstream was a local mock server returning predictable
  responses, not a real LLM service.
- These measurements are specific to the tested macOS environment and
  mock-server implementation.
- Zero HTTP failures do not prove that every usage event was persisted
  exactly once.
- The tests did not establish p99 latency, production capacity, or
  behavior under real provider latency and rate limits.
- No controlled comparison with Bifrost or another gateway was
  performed under identical conditions.
- For reproducibility, record the Mac model, macOS version, Go
  version, k6 version, mock-server revision, and Setu commit with
  future runs.

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
├── test/                     # Mock servers and JavaScript client tests
└── README.md
```

---

## 🛠️ How to Run Locally

### 1. Spin Up Infrastructure

Start Redis and PostgreSQL containers in the background:

```bash
docker compose up -d
```

### 2. Configure Environment

Create a `.env` file in `apps/api/` (see the template in
`apps/api/.env`):

```env
SETU_PRIMARY.ENV="local"
SETU_PRIMARY.LOGGERLEVEL="debug"

SETU_SERVER.PORT=8080
SETU_REDIS.ADDRESS="localhost:6379"

# Downstream credentials
SETU_GEMINI.APIKEY="your-gemini-key"
```

### 3. Start Mock Server (For Testing)

To test OpenAI and Anthropic integrations without spending money on real
keys, start the local mock streaming server:

```bash
cd test
node server.js
```

### 4. Run Setu Gateway

From the repository root, start the Go server:

```bash
cd apps/api
go run cmd/setu/main.go
# Or, if Task is installed:
task run
```

### 5. Send Test Requests

Send a namespaced request to the gateway. Setu proxies the request,
parses usage metadata, calculates cost, and updates spend tracking.

**OpenAI endpoint:**

```bash
curl -X POST http://localhost:8080/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}], "stream": true}'
```

**Anthropic endpoint:**

```bash
curl -X POST http://localhost:8080/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 1024, "messages": [{"role": "user", "content": "Hello"}]}'
```
