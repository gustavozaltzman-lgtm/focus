import { pool } from '../config/db';

export interface ContextShare {
  id: string;
  context_id: string;
  shared_with_user_id: string;
  created_at: Date;
}

export interface ContextShareWithUser extends ContextShare {
  shared_with_email: string;
  shared_with_name: string;
}

export async function createShare(
  contextId: string,
  sharedWithUserId: string,
): Promise<ContextShare> {
  const result = await pool.query<ContextShare>(
    `INSERT INTO context_shares (context_id, shared_with_user_id) VALUES ($1, $2) RETURNING *`,
    [contextId, sharedWithUserId],
  );
  return result.rows[0];
}

export async function listSharesForContext(contextId: string): Promise<ContextShareWithUser[]> {
  const result = await pool.query<ContextShareWithUser>(
    `SELECT cs.*, u.email AS shared_with_email, u.full_name AS shared_with_name
     FROM context_shares cs
     JOIN users u ON u.id = cs.shared_with_user_id
     WHERE cs.context_id = $1
     ORDER BY cs.created_at DESC`,
    [contextId],
  );
  return result.rows;
}

export async function findShare(contextId: string, userId: string): Promise<ContextShare | null> {
  const result = await pool.query<ContextShare>(
    'SELECT * FROM context_shares WHERE context_id = $1 AND shared_with_user_id = $2',
    [contextId, userId],
  );
  return result.rows[0] ?? null;
}

export async function deleteShare(id: string, contextId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM context_shares WHERE id = $1 AND context_id = $2',
    [id, contextId],
  );
  return (result.rowCount ?? 0) > 0;
}

export interface SharedContextForUser {
  id: string;
  name: string;
  color_hex: string;
  owner_name: string;
}

export async function listContextsSharedWithUser(userId: string): Promise<SharedContextForUser[]> {
  const result = await pool.query<SharedContextForUser>(
    `SELECT c.id, c.name, c.color_hex, u.full_name AS owner_name
     FROM context_shares cs
     JOIN contexts c ON c.id = cs.context_id
     JOIN users u ON u.id = c.user_id
     WHERE cs.shared_with_user_id = $1
     ORDER BY c.name ASC`,
    [userId],
  );
  return result.rows;
}
