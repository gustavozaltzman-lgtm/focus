-- Fecha límite (vencimiento real) separada de scheduled_date (cuándo pensás
-- trabajarla), y una referencia libre de vuelta al correo/origen de la tarea.
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS source_ref TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
