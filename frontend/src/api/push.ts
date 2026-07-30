import { apiClient } from './client';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function fetchVapidPublicKey(): Promise<{ publicKey: string | null }> {
  const { data } = await apiClient.get<{ publicKey: string | null }>('/push/vapid-public-key');
  return data;
}

export async function subscribe(subscription: PushSubscriptionPayload): Promise<void> {
  await apiClient.post('/push/subscribe', subscription);
}

export async function unsubscribe(endpoint: string): Promise<void> {
  await apiClient.post('/push/unsubscribe', { endpoint });
}
