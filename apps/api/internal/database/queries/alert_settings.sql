-- name: CreateAlertConfig :one
INSERT INTO alert_settings (project_id, trigger_threshold_pct, notify_slack, slack_webhook_url_encrypted,slack_webhook_nonce)
VALUES ($1, $2, $3, $4,$5)
RETURNING *;

-- name: GetAlertConfigByProjectID :one
SELECT * FROM alert_settings
WHERE project_id = $1;

-- name: UpdateAlertConfig :one
UPDATE alert_settings
SET trigger_threshold_pct = $1,
    notify_slack = $2,
    slack_webhook_url_encrypted = $3,
    slack_webhook_nonce=$4,
    updated_at = NOW()
WHERE project_id = $5
RETURNING *;

-- name: DeleteAlertConfig :exec
DELETE FROM alert_settings
WHERE project_id = $1;

-- name: UpdateLastNotifiedAt :exec
UPDATE alert_settings
SET last_notified_at = NOW(),
    updated_at = NOW()
WHERE project_id = $1;

-- name: ResetLastNotifiedAt :exec
UPDATE alert_settings
SET last_notified_at = NULL,
    updated_at = NOW()
WHERE project_id = $1;
