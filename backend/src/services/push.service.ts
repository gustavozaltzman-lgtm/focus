import webpush from 'web-push';
import { env } from '../config/env';
import * as pushRepo from '../repositories/push-subscription.repository';

const isConfigured = Boolean(env.vapidPublicKey && env.vapidPrivateKey);

if (isConfigured) {
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey!, env.vapidPrivateKey!);
} else {
  console.warn('VAPID keys not set — push notifications are disabled.');
}

export function isPushConfigured(): boolean {
  return isConfigured;
}

export async function subscribe(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
): Promise<void> {
  await pushRepo.upsertSubscription(userId, endpoint, p256dh, auth);
}

export async function unsubscribe(userId: string, endpoint: string): Promise<void> {
  await pushRepo.deleteSubscriptionByEndpoint(userId, endpoint);
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
}

export async function sendToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!isConfigured) return;
  const subscriptions = await pushRepo.listSubscriptionsForUser(userId);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await pushRepo.deleteSubscriptionByEndpointGlobal(sub.endpoint);
        } else {
          console.error('Push notification failed:', error);
        }
      }
    }),
  );
}
