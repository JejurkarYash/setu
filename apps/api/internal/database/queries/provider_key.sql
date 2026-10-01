-- name: CreateProviderKey :one
INSERT INTO provider_keys (project_id, provider, encrypted_key, nonce)
VALUES ($1, $2, $3, $4)
ON CONFLICT (project_id, provider) 
DO UPDATE SET 
    encrypted_key = EXCLUDED.encrypted_key,
    nonce = EXCLUDED.nonce,
    updated_at = NOW()
RETURNING *;

-- name: GetProviderKey :one
SELECT encrypted_key, nonce 
FROM provider_keys
WHERE project_id = $1 AND provider = $2 AND is_active = true;

-- name: ListProviderKeysByProjectID :many
SELECT id, provider, is_active, created_at, updated_at 
FROM provider_keys
WHERE project_id = $1;

-- name: UpdateProviderKeyStatus :one
UPDATE provider_keys
SET is_active = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteProviderKey :exec
DELETE FROM provider_keys
WHERE id = $1;
