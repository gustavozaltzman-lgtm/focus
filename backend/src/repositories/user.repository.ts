import { pool } from '../config/db';
import { User } from '../types/domain';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  fullName: string;
}): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [params.email, params.passwordHash, params.fullName],
  );
  return result.rows[0];
}

export async function setUserAnthropicKey(
  id: string,
  encryptedKey: string,
  last4: string,
): Promise<void> {
  await pool.query(
    `UPDATE users
     SET anthropic_api_key_encrypted = $2, anthropic_api_key_last4 = $3, updated_at = now()
     WHERE id = $1`,
    [id, encryptedKey, last4],
  );
}

export async function clearUserAnthropicKey(id: string): Promise<void> {
  await pool.query(
    `UPDATE users
     SET anthropic_api_key_encrypted = NULL, anthropic_api_key_last4 = NULL, updated_at = now()
     WHERE id = $1`,
    [id],
  );
}

export async function updateUserProfile(
  id: string,
  params: { fullName?: string; avatarUrl?: string },
): Promise<User | null> {
  const result = await pool.query<User>(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, params.fullName ?? null, params.avatarUrl ?? null],
  );
  return result.rows[0] ?? null;
}
