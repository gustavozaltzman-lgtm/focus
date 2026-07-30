import { Response } from 'express';
import * as contextService from '../services/context.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  return req.user.userId;
}

export const listContexts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const contexts = await contextService.getContexts(requireUserId(req));
  res.status(200).json({ contexts });
});

export const getContext = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const context = await contextService.getContext(req.params.id, requireUserId(req));
  res.status(200).json({ context });
});

export const createContext = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const context = await contextService.createContext(requireUserId(req), req.body);
  res.status(201).json({ context });
});

export const updateContext = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const context = await contextService.updateContext(
    req.params.id,
    requireUserId(req),
    req.body,
  );
  res.status(200).json({ context });
});

export const deleteContext = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await contextService.deleteContext(req.params.id, requireUserId(req));
  res.status(204).send();
});
