import { pool } from '../config/db';

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export async function upsertSubscription(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
): Promise<PushSubscription> {
  const result = await pool.query<PushSubscription>(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4
     RETURNING *`,
    [userId, endpoint, p256dh, auth],
  );
  return result.rows[0];
}

export async function listSubscriptionsForUser(userId: string): Promise<PushSubscription[]> {
  const result = await pool.query<PushSubscription>(
    'SELECT * FROM push_subscriptions WHERE user_id = $1',
    [userId],
  );
  return result.rows;
}

export async function deleteSubscriptionByEndpoint(
  userId: string,
  endpoint: string,
): Promise<void> {
  await pool.query('DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2', [
    userId,
    endpoint,
  ]);
}

export async function deleteSubscriptionByEndpointGlobal(endpoint: string): Promise<void> {
  await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
}
