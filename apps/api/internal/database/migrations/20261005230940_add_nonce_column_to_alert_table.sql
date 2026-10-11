-- +goose Up
ALTER TABLE alert_settings
    RENAME COLUMN slack_webhook_url
    TO slack_webhook_url_encrypted;

ALTER TABLE alert_settings
    ADD COLUMN slack_webhook_nonce BYTEA;


-- +goose Down
ALTER TABLE alert_settings
    DROP COLUMN slack_webhook_nonce;

ALTER TABLE alert_settings
    RENAME COLUMN slack_webhook_url_encrypted
    TO slack_webhook_url;