-- name: CreateApiKey :one 
INSERT INTO api_key (project_id, key_prefix, key_hash, expires_at)
VALUES ($1, $2, $3, $4)
RETURNING *;

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

-- name: ListApiKeysByProjectID :many
SELECT * FROM api_key
WHERE project_id = $1
ORDER BY created_at DESC;

-- name: UpdateApiKeyStatus :one
UPDATE api_key
SET is_active = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;  

-- name: UpdateApiKeyLastUsed :exec
UPDATE api_key
SET last_used_at = NOW()
WHERE id = $1;

-- name: DeleteApiKey :exec
DELETE FROM api_key
WHERE id = $1;

-- name: GetKeyHashFromProjectID :one
SELECT key_hash
FROM api_key
WHERE project_id = $1
  AND is_active = TRUE;

-- name: GetActiveKeyFromProjectID :one 
SELECT * FROM api_key 
WHERE project_id = $1 AND is_active = TRUE; 