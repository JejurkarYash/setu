-- name: CreateProject :one
INSERT INTO projects ( name, user_id, monthly_budget)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetProjectByID :one
SELECT * FROM projects
WHERE id = $1 LIMIT 1;

-- name: ListProjectsByUserID :many
SELECT * FROM projects
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetAllProjects :many
SELECT * FROM projects;

-- name: UpdateProjectBudget :one
UPDATE projects
SET monthly_budget = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateProjectName :one
UPDATE projects
SET name = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteProject :exec
DELETE FROM projects
WHERE id = $1;


-- name: UpdateProject :one
UPDATE projects
SET name = $2, monthly_budget = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetProjectByUserIDAndProjectID :one 
SELECT * FROM projects 
WHERE id = $1 AND user_id = $2; 

-- name: UpdateSpendDB :one 
UPDATE projects
SET spend = spend + $1,
    updated_at = NOW()
WHERE id = $2
RETURNING *;