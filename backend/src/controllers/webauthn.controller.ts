import { Response } from 'express';
import { findUserById } from '../repositories/user.repository';
import * as webauthnService from '../services/webauthn.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  return req.user.userId;
}

export const getRegistrationOptions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await findUserById(requireUserId(req));
    if (!user) throw new AppError('User not found', 404);
    const options = await webauthnService.createRegistrationOptions(user);
    res.status(200).json(options);
  },
);

export const verifyRegistration = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await findUserById(requireUserId(req));
    if (!user) throw new AppError('User not found', 404);
    await webauthnService.verifyRegistration(user, req.body.response, req.body.deviceName ?? null);
    res.status(200).json({ verified: true });
  },
);

export const listDevices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const devices = await webauthnService.listDevices(requireUserId(req));
  res.status(200).json({ devices });
});

export const getAuthenticationOptions = asyncHandler(async (req, res: Response) => {
  const options = await webauthnService.createAuthenticationOptions(req.body.email);
  res.status(200).json(options);
});

export const verifyAuthentication = asyncHandler(async (req, res: Response) => {
  const result = await webauthnService.verifyAuthentication(req.body.email, req.body.response);
  res.status(200).json(result);
});
