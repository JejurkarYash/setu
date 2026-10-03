-- name: InsertUsageLog :one
INSERT INTO usage_logs (project_id, model, prompt_tokens, completion_tokens, cost_usd, status_code)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetUsageLogByID :one
SELECT * FROM usage_logs
WHERE id = $1;

-- name: ListUsageLogsByProject :many
SELECT * FROM usage_logs
WHERE project_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListUsageLogsByProjectAndModel :many
SELECT * FROM usage_logs
WHERE project_id = $1 AND model = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListUsageLogsByProjectInRange :many
SELECT * FROM usage_logs
WHERE project_id = $1
  AND created_at >= $2
  AND created_at <= $3
ORDER BY created_at DESC;

-- name: GetTotalCostByProject :one
SELECT COALESCE(SUM(cost_usd), 0)::DECIMAL(10,6) AS total_cost
FROM usage_logs
WHERE project_id = $1;

-- name: GetTotalCostByProjectInRange :one
SELECT COALESCE(SUM(cost_usd), 0)::DECIMAL(10,6) AS total_cost
FROM usage_logs
WHERE project_id = $1
  AND created_at >= $2
  AND created_at <= $3;

-- name: GetUsageSummaryByModel :many
SELECT
    model,
    COUNT(*)                                         AS request_count,
    SUM(prompt_tokens)                               AS total_prompt_tokens,
    SUM(completion_tokens)                           AS total_completion_tokens,
    COALESCE(SUM(cost_usd), 0)::DECIMAL(10,6)       AS total_cost
FROM usage_logs
WHERE project_id = $1
GROUP BY model
ORDER BY total_cost DESC;

-- name: DeleteUsageLog :exec
DELETE FROM usage_logs
WHERE id = $1;

-- name: DeleteUsageLogsByProject :exec
DELETE FROM usage_logs
WHERE project_id = $1;