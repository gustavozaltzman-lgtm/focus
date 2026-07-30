import { Response } from 'express';
import { env } from '../config/env';
import * as pushService from '../services/push.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  return req.user.userId;
}

export const getPublicKey = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ publicKey: env.vapidPublicKey ?? null });
});

export const subscribe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { endpoint, keys } = req.body;
  await pushService.subscribe(requireUserId(req), endpoint, keys.p256dh, keys.auth);
  res.status(201).json({ ok: true });
});

export const unsubscribe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await pushService.unsubscribe(requireUserId(req), req.body.endpoint);
  res.status(204).send();
});
