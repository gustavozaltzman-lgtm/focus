import { pool } from '../config/db';
import { Context } from '../types/domain';

export async function listContexts(userId: string): Promise<Context[]> {
  const result = await pool.query<Context>(
    'SELECT * FROM contexts WHERE user_id = $1 ORDER BY name ASC',
    [userId],
  );
  return result.rows;
}

export async function findContextById(id: string, userId: string): Promise<Context | null> {
  const result = await pool.query<Context>(
    'SELECT * FROM contexts WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function findContextByIdUnscoped(id: string): Promise<Context | null> {
  const result = await pool.query<Context>('SELECT * FROM contexts WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function findContextByName(name: string, userId: string): Promise<Context | null> {
  const result = await pool.query<Context>(
    'SELECT * FROM contexts WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
    [userId, name],
  );
  return result.rows[0] ?? null;
}

export async function createContext(params: {
  userId: string;
  name: string;
  colorHex: string;
}): Promise<Context> {
  const result = await pool.query<Context>(
    `INSERT INTO contexts (user_id, name, color_hex)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [params.userId, params.name, params.colorHex],
  );
  return result.rows[0];
}

export async function updateContext(
  id: string,
  userId: string,
  params: { name?: string; colorHex?: string },
): Promise<Context | null> {
  const result = await pool.query<Context>(
    `UPDATE contexts
     SET name = COALESCE($3, name),
         color_hex = COALESCE($4, color_hex)
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, params.name ?? null, params.colorHex ?? null],
  );
  return result.rows[0] ?? null;
}

export async function deleteContext(id: string, userId: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM contexts WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function countTasksByContext(userId: string): Promise<Map<string, number>> {
  const result = await pool.query<{ context_id: string; count: string }>(
    `SELECT context_id, COUNT(*)::text AS count
     FROM tasks
     WHERE user_id = $1 AND context_id IS NOT NULL AND status != 'completed'
     GROUP BY context_id`,
    [userId],
  );
  return new Map(result.rows.map((row) => [row.context_id, Number(row.count)]));
}
