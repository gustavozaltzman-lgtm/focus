import { Request, Response } from 'express';
import { loginUser, registerUser, toPublicUser } from '../services/auth.service';
import { findUserById } from '../repositories/user.repository';
import {
  clearPersonalAnthropicKey,
  setPersonalAnthropicKey,
} from '../services/user-anthropic-key.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json(result);
});

export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  const user = await findUserById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ user: toPublicUser(user) });
});

export const setAnthropicKey = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  const { last4 } = await setPersonalAnthropicKey(req.user.userId, req.body.apiKey);
  res.status(200).json({ hasAnthropicKey: true, anthropicKeyLast4: last4 });
});

export const removeAnthropicKey = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  await clearPersonalAnthropicKey(req.user.userId);
  res.status(200).json({ hasAnthropicKey: false, anthropicKeyLast4: null });
});
