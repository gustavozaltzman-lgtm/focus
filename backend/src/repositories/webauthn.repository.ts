import { pool } from '../config/db';

export interface WebauthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: string;
  device_type: string;
  backed_up: boolean;
  transports: string[] | null;
  device_name: string | null;
  created_at: Date;
  last_used_at: Date | null;
}

export async function listCredentialsForUser(userId: string): Promise<WebauthnCredential[]> {
  const result = await pool.query<WebauthnCredential>(
    'SELECT * FROM webauthn_credentials WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return result.rows;
}

export async function findCredentialById(credentialId: string): Promise<WebauthnCredential | null> {
  const result = await pool.query<WebauthnCredential>(
    'SELECT * FROM webauthn_credentials WHERE credential_id = $1',
    [credentialId],
  );
  return result.rows[0] ?? null;
}

export interface CreateCredentialParams {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports: string[] | null;
  deviceName: string | null;
}

export async function createCredential(params: CreateCredentialParams): Promise<WebauthnCredential> {
  const result = await pool.query<WebauthnCredential>(
    `INSERT INTO webauthn_credentials
       (user_id, credential_id, public_key, counter, device_type, backed_up, transports, device_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      params.userId,
      params.credentialId,
      params.publicKey,
      params.counter,
      params.deviceType,
      params.backedUp,
      params.transports,
      params.deviceName,
    ],
  );
  return result.rows[0];
}

export async function updateCredentialCounter(credentialId: string, counter: number): Promise<void> {
  await pool.query(
    'UPDATE webauthn_credentials SET counter = $2, last_used_at = now() WHERE credential_id = $1',
    [credentialId, counter],
  );
}

export async function deleteCredential(id: string, userId: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM webauthn_credentials WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
