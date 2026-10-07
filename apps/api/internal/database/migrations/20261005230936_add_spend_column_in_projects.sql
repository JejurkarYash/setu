-- +goose Up
ALTER TABLE projects ADD COLUMN spend NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- +goose Down
ALTER TABLE projects DROP COLUMN spend;
