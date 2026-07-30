import { pool } from '../config/db';
import { ActivityLog } from '../types/domain';

export async function logActivity(params: {
  userId: string;
  taskId: string | null;
  action: string;
}): Promise<ActivityLog> {
  const result = await pool.query<ActivityLog>(
    `INSERT INTO activity_logs (user_id, task_id, action) VALUES ($1, $2, $3) RETURNING *`,
    [params.userId, params.taskId, params.action],
  );
  return result.rows[0];
}

export async function listRecentActivity(userId: string, limit: number): Promise<ActivityLog[]> {
  const result = await pool.query<ActivityLog>(
    `SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return result.rows;
}

export async function listActivityForTask(taskId: string, limit: number): Promise<ActivityLog[]> {
  const result = await pool.query<ActivityLog>(
    `SELECT * FROM activity_logs WHERE task_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [taskId, limit],
  );
  return result.rows;
}
