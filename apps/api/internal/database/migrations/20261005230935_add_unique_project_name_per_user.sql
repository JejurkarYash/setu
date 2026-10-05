-- +goose Up
ALTER TABLE projects ADD CONSTRAINT unique_user_project_name UNIQUE (user_id, name);

-- +goose Down
ALTER TABLE projects DROP CONSTRAINT unique_user_project_name;
