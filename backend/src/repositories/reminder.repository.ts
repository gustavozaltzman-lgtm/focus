import { pool } from '../config/db';
import { Reminder } from '../types/domain';

export async function createReminder(taskId: string, triggerAt: Date): Promise<Reminder> {
  const result = await pool.query<Reminder>(
    `INSERT INTO reminders (task_id, trigger_at) VALUES ($1, $2) RETURNING *`,
    [taskId, triggerAt],
  );
  return result.rows[0];
}

export async function listRemindersForTask(taskId: string): Promise<Reminder[]> {
  const result = await pool.query<Reminder>(
    'SELECT * FROM reminders WHERE task_id = $1 ORDER BY trigger_at ASC',
    [taskId],
  );
  return result.rows;
}

export async function listPendingReminders(before: Date): Promise<Reminder[]> {
  const result = await pool.query<Reminder>(
    `SELECT * FROM reminders WHERE status = 'pending' AND trigger_at <= $1 ORDER BY trigger_at ASC`,
    [before],
  );
  return result.rows;
}

export async function updateReminderStatus(
  id: string,
  status: 'pending' | 'sent' | 'snoozed',
): Promise<Reminder | null> {
  const result = await pool.query<Reminder>(
    'UPDATE reminders SET status = $2 WHERE id = $1 RETURNING *',
    [id, status],
  );
  return result.rows[0] ?? null;
}
