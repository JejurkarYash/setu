-- name: GetProjectIDFromKeyHash :one
SELECT project_id FROM api_key
WHERE key_hash = $1;

-- name: GetActiveKeyMetadata :one
SELECT 
    api_key.project_id,
    projects.monthly_budget AS budget_limit
FROM api_key
JOIN projects ON api_key.project_id = projects.id
WHERE api_key.key_hash = $1 AND api_key.is_active = true;

