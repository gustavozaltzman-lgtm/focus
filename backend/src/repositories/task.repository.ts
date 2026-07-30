import { pool } from '../config/db';
import { Task, TaskStatus } from '../types/domain';

export interface TaskFilters {
  status?: TaskStatus;
  contextId?: string;
  scheduledDate?: string;
  limit: number;
  offset: number;
}

export async function listTasks(userId: string, filters: TaskFilters): Promise<Task[]> {
  const conditions: string[] = ['user_id = $1'];
  const params: unknown[] = [userId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.contextId) {
    params.push(filters.contextId);
    conditions.push(`context_id = $${params.length}`);
  }
  if (filters.scheduledDate) {
    params.push(filters.scheduledDate);
    conditions.push(`scheduled_date = $${params.length}`);
  }

  params.push(filters.limit);
  const limitIndex = params.length;
  params.push(filters.offset);
  const offsetIndex = params.length;

  const query = `
    SELECT * FROM tasks
    WHERE ${conditions.join(' AND ')}
    ORDER BY
      CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      scheduled_date ASC NULLS LAST,
      created_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const result = await pool.query<Task>(query, params);
  return result.rows;
}

export async function listTasksByContext(contextId: string): Promise<Task[]> {
  const result = await pool.query<Task>(
    `SELECT * FROM tasks
     WHERE context_id = $1 AND status != 'completed'
     ORDER BY
       CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
       scheduled_date ASC NULLS LAST,
       created_at DESC`,
    [contextId],
  );
  return result.rows;
}

export async function countTasksTodayForUser(userId: string, today: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM tasks
     WHERE user_id = $1 AND status != 'completed'
       AND (status = 'today' OR scheduled_date = $2)`,
    [userId, today],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function countTasksByStatus(userId: string): Promise<Record<string, number>> {
  const result = await pool.query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::text AS count FROM tasks WHERE user_id = $1 GROUP BY status`,
    [userId],
  );
  const counts: Record<string, number> = {};
  for (const row of result.rows) {
    counts[row.status] = Number(row.count);
  }
  return counts;
}

export async function countUrgentTasks(userId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM tasks
     WHERE user_id = $1 AND priority = 'high' AND status != 'completed'`,
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function findTaskById(id: string, userId: string): Promise<Task | null> {
  const result = await pool.query<Task>('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return result.rows[0] ?? null;
}

export interface CreateTaskParams {
  userId: string;
  contextId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
}

export async function createTask(params: CreateTaskParams): Promise<Task> {
  const result = await pool.query<Task>(
    `INSERT INTO tasks (user_id, context_id, title, description, status, priority, scheduled_date, scheduled_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      params.userId,
      params.contextId,
      params.title,
      params.description,
      params.status,
      params.priority,
      params.scheduledDate,
      params.scheduledTime,
    ],
  );
  return result.rows[0];
}

export interface UpdateTaskParams {
  contextId?: string | null;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
}

export async function updateTask(
  id: string,
  userId: string,
  params: UpdateTaskParams,
): Promise<Task | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  function setField(column: string, value: unknown) {
    values.push(value);
    setClauses.push(`${column} = $${values.length + 2}`);
  }

  if ('contextId' in params) setField('context_id', params.contextId);
  if ('title' in params) setField('title', params.title);
  if ('description' in params) setField('description', params.description);
  if ('status' in params) setField('status', params.status);
  if ('priority' in params) setField('priority', params.priority);
  if ('scheduledDate' in params) setField('scheduled_date', params.scheduledDate);
  if ('scheduledTime' in params) setField('scheduled_time', params.scheduledTime);
  if (params.status === 'completed') {
    setClauses.push('completed_at = now()');
  }
  setClauses.push('updated_at = now()');

  if (setClauses.length === 1) {
    return findTaskById(id, userId);
  }

  const query = `
    UPDATE tasks SET ${setClauses.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;

  const result = await pool.query<Task>(query, [id, userId, ...values]);
  return result.rows[0] ?? null;
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
