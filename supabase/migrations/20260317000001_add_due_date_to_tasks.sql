-- Add optional due date to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date date;
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks (due_date);
