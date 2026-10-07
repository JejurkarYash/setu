-- +goose Up
ALTER TABLE projects
ALTER COLUMN spend TYPE NUMERIC(10,4);

-- +goose Down
ALTER TABLE projects
ALTER COLUMN spend TYPE NUMERIC(10,2);