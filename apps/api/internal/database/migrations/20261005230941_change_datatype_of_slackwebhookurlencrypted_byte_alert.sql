-- +goose Up
ALTER TABLE alert_settings
ALTER COLUMN slack_webhook_url_encrypted TYPE BYTEA
USING convert_to(slack_webhook_url_encrypted, 'UTF8');

-- +goose Down
ALTER TABLE alert_settings
ALTER COLUMN slack_webhook_url_encrypted TYPE TEXT
USING convert_from(slack_   webhook_url_encrypted, 'UTF8');