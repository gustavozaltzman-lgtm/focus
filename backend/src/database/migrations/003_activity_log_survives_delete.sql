-- Activity logs are an audit trail: they should survive even after the task
-- that generated them is deleted (e.g. the "deleted" entry itself), instead
-- of being wiped by the cascade. Deleting the task now leaves the log with
-- task_id = NULL rather than removing the row.
ALTER TABLE activity_logs
  DROP CONSTRAINT activity_logs_task_id_fkey,
  ADD CONSTRAINT activity_logs_task_id_fkey
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;
