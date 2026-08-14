-- +goose Up

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    monthly_budget NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); 

CREATE TABLE IF NOT EXISTS api_key (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, 
key_prefix VARCHAR(16) NOT NULL, 
key_hash VARCHAR(64) NOT NULL, 
is_active BOOLEAN NOT NULL DEFAULT TRUE, 
expires_at TIMESTAMPTZ , 
last_used_at TIMESTAMPTZ, 
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); 

CREATE TABLE IF NOT EXISTS provider_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,         -- 'openai', 'anthropic', 'gemini', 'groq'
    encrypted_key BYTEA NOT NULL,          -- AES-256-GCM ciphertext
    nonce BYTEA NOT NULL,                  -- Unique 12-byte initialization vector per key
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enforce one active key per provider per project
    CONSTRAINT uq_project_provider UNIQUE(project_id, provider)
);

CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    model VARCHAR(100) NOT NULL,
    prompt_tokens INT NOT NULL,
    completion_tokens INT NOT NULL,
    cost_usd DECIMAL(10, 6) NOT NULL,
    status_code INT NOT NULL, -- 200 OK or 429 Blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL, -- Unique ID provided by Google (sub)
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,            -- 'openai', 'anthropic', 'google'
    model_name VARCHAR(100) UNIQUE NOT NULL,  -- 'gpt-4o', 'claude-3-5-sonnet'
    prompt_token_cost_usd NUMERIC(12, 8),    -- e.g., 0.0000025 per token
    completion_token_cost_usd NUMERIC(12, 8),-- e.g., 0.0000100 per token
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    slack_webhook_url TEXT,
    email_notification VARCHAR(255),
    trigger_threshold_pct INT DEFAULT 80, -- Notify at 80% spend
    is_triggered BOOLEAN DEFAULT FALSE
);

-- +goose Down
DROP TABLE IF EXISTS alert_settings;
DROP TABLE IF EXISTS model_rates;
DROP TABLE IF EXISTS usage_logs;
DROP TABLE IF EXISTS provider_keys;
DROP TABLE IF EXISTS api_key;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users; 