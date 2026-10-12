
-- name: CreateModelRate :exec
INSERT INTO model_rates (
    provider,
    model_name,
    prompt_token_cost_usd,
    completion_token_cost_usd
)
VALUES ($1, $2, $3, $4)
ON CONFLICT (model_name) DO NOTHING;


-- name: GetModelRate :one
SELECT
    provider,
    model_name,
    prompt_token_cost_usd::TEXT AS prompt_token_cost_usd,
    completion_token_cost_usd::TEXT AS completion_token_cost_usd
FROM model_rates
WHERE provider = $1
  AND model_name = $2;

