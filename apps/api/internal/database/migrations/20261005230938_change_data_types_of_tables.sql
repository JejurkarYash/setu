-- +goose Up

-- 1. Elevate cost precision for usage logs & model rates to prevent sub-microcent truncation
ALTER TABLE usage_logs 
    ALTER COLUMN project_id SET NOT NULL,
    ALTER COLUMN prompt_tokens SET DEFAULT 0,
    ALTER COLUMN completion_tokens SET DEFAULT 0,
    ALTER COLUMN cost_usd TYPE NUMERIC(16, 10),
    ALTER COLUMN cost_usd SET DEFAULT 0.0000000000,
    ADD CONSTRAINT fk_usage_logs_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE model_rates 
    ALTER COLUMN prompt_token_cost_usd TYPE NUMERIC(16, 10),
    ALTER COLUMN prompt_token_cost_usd SET DEFAULT 0.0000000000,
    ALTER COLUMN prompt_token_cost_usd SET NOT NULL,
    ALTER COLUMN completion_token_cost_usd TYPE NUMERIC(16, 10),
    ALTER COLUMN completion_token_cost_usd SET DEFAULT 0.0000000000,
    ALTER COLUMN completion_token_cost_usd SET NOT NULL;

-- 2. Expand project monthly budget precision
ALTER TABLE projects 
    ALTER COLUMN monthly_budget TYPE NUMERIC(12, 6),
    ALTER COLUMN monthly_budget SET DEFAULT 0.000000,
    ALTER COLUMN spend TYPE NUMERIC(16, 10),
    ALTER COLUMN spend SET DEFAULT 0.0000000000;

-- 3. Add UNIQUE constraint to api_key.key_hash for O(1) B-tree lookup safety
ALTER TABLE api_key 
    ADD CONSTRAINT uq_api_key_hash UNIQUE (key_hash);

-- 4. Ensure alert_settings project_id is unique & mandatory
ALTER TABLE alert_settings 
    ALTER COLUMN project_id SET NOT NULL,
    ALTER COLUMN trigger_threshold_pct SET NOT NULL,
    ALTER COLUMN is_triggered SET NOT NULL,
    ADD CONSTRAINT uq_alert_settings_project UNIQUE (project_id);

-- 5. Add critical hot-path & analytical B-tree indexes
CREATE INDEX IF NOT EXISTS idx_api_key_hash ON api_key(key_hash) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_provider_keys_project ON provider_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_project_created ON usage_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_rates_name ON model_rates(model_name);


-- +goose Down

-- Drop indexes
DROP INDEX IF EXISTS idx_model_rates_name;
DROP INDEX IF EXISTS idx_usage_logs_project_created;
DROP INDEX IF EXISTS idx_provider_keys_project;
DROP INDEX IF EXISTS idx_api_key_hash;

-- Drop constraints
ALTER TABLE alert_settings 
    DROP CONSTRAINT IF EXISTS uq_alert_settings_project,
    ALTER COLUMN project_id DROP NOT NULL;

ALTER TABLE api_key 
    DROP CONSTRAINT IF EXISTS uq_api_key_hash;

ALTER TABLE usage_logs 
    DROP CONSTRAINT IF EXISTS fk_usage_logs_project,
    ALTER COLUMN project_id DROP NOT NULL;

-- Revert data types
ALTER TABLE projects 
    ALTER COLUMN monthly_budget TYPE NUMERIC(10, 4),
    ALTER COLUMN monthly_budget SET DEFAULT 0.0000,
    ALTER COLUMN spend TYPE NUMERIC(10, 2),
    ALTER COLUMN spend SET DEFAULT 0.00;

ALTER TABLE model_rates 
    ALTER COLUMN prompt_token_cost_usd TYPE NUMERIC(12, 8),
    ALTER COLUMN prompt_token_cost_usd DROP NOT NULL,
    ALTER COLUMN completion_token_cost_usd TYPE NUMERIC(12, 8),
    ALTER COLUMN completion_token_cost_usd DROP NOT NULL;

ALTER TABLE usage_logs 
    ALTER COLUMN cost_usd TYPE DECIMAL(10, 6);