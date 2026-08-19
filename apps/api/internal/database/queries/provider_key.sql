-- name: GetProviderKey :one
SELECT encrypted_key, nonce 
FROM provider_keys
WHERE project_id = $1 AND provider = $2 AND is_active = true;
