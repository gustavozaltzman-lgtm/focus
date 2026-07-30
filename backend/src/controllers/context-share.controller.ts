import { Response } from 'express';
import * as shareService from '../services/context-share.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  return req.user.userId;
}

export const share = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const created = await shareService.shareContext(
    requireUserId(req),
    req.params.id,
    req.body.email,
  );
  res.status(201).json({ share: created });
});

export const listShares = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shares = await shareService.listShares(requireUserId(req), req.params.id);
  res.status(200).json({ shares });
});

export const revokeShare = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await shareService.revokeShare(requireUserId(req), req.params.id, req.params.shareId);
  res.status(204).send();
});

export const listSharedWithMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const contexts = await shareService.listSharedWithMe(requireUserId(req));
  res.status(200).json({ contexts });
});

export const getSharedView = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const view = await shareService.getSharedContextView(requireUserId(req), req.params.id);
  res.status(200).json(view);
});
