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

export interface DueReminder extends Reminder {
  task_title: string;
}

export async function listDueRemindersForUser(userId: string, before: Date): Promise<DueReminder[]> {
  const result = await pool.query<DueReminder>(
    `SELECT r.*, t.title AS task_title
     FROM reminders r
     JOIN tasks t ON t.id = r.task_id
     WHERE t.user_id = $1 AND r.status = 'pending' AND r.trigger_at <= $2
     ORDER BY r.trigger_at ASC`,
    [userId, before],
  );
  return result.rows;
}

export async function findReminderForUser(id: string, userId: string): Promise<Reminder | null> {
  const result = await pool.query<Reminder>(
    `SELECT r.* FROM reminders r
     JOIN tasks t ON t.id = r.task_id
     WHERE r.id = $1 AND t.user_id = $2`,
    [id, userId],
  );
  return result.rows[0] ?? null;
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

export async function rescheduleReminder(id: string, triggerAt: Date): Promise<Reminder | null> {
  const result = await pool.query<Reminder>(
    `UPDATE reminders SET trigger_at = $2, status = 'pending' WHERE id = $1 RETURNING *`,
    [id, triggerAt],
  );
  return result.rows[0] ?? null;
}

export async function deleteReminder(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM reminders WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
