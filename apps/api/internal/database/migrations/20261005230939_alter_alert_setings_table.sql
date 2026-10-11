-- +goose Up
ALTER TABLE alert_settings
    DROP COLUMN is_triggered,
    DROP COLUMN email_notification,
    ADD COLUMN notify_slack BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN last_notified_at TIMESTAMPTZ,
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- +goose Down
ALTER TABLE alert_settings
    DROP COLUMN notify_slack,
    DROP COLUMN last_notified_at,
    DROP COLUMN created_at,
    DROP COLUMN updated_at,
    ADD COLUMN is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN email_notification VARCHAR(255);