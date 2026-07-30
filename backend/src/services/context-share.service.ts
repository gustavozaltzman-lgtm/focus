import * as shareRepo from '../repositories/context-share.repository';
import * as contextRepo from '../repositories/context.repository';
import * as taskRepo from '../repositories/task.repository';
import { findUserByEmail, findUserById } from '../repositories/user.repository';
import { NotFoundError } from './context.service';
import { AppError } from '../middlewares/error-handler.middleware';
import { Context, Task } from '../types/domain';

async function assertOwnsContext(contextId: string, ownerId: string): Promise<Context> {
  const context = await contextRepo.findContextById(contextId, ownerId);
  if (!context) throw new NotFoundError('Context not found');
  return context;
}

export async function shareContext(ownerId: string, contextId: string, email: string) {
  await assertOwnsContext(contextId, ownerId);

  const targetUser = await findUserByEmail(email.toLowerCase());
  if (!targetUser) {
    throw new AppError('No hay ningún usuario registrado con ese email', 404);
  }
  if (targetUser.id === ownerId) {
    throw new AppError('No podés compartir un contexto con vos mismo', 400);
  }

  const existing = await shareRepo.findShare(contextId, targetUser.id);
  if (existing) {
    throw new AppError('Ya está compartido con ese usuario', 409);
  }

  return shareRepo.createShare(contextId, targetUser.id);
}

export async function listShares(ownerId: string, contextId: string) {
  await assertOwnsContext(contextId, ownerId);
  return shareRepo.listSharesForContext(contextId);
}

export async function revokeShare(ownerId: string, contextId: string, shareId: string) {
  await assertOwnsContext(contextId, ownerId);
  const deleted = await shareRepo.deleteShare(shareId, contextId);
  if (!deleted) throw new NotFoundError('Share not found');
}

export async function listSharedWithMe(userId: string) {
  return shareRepo.listContextsSharedWithUser(userId);
}

export interface SharedContextView {
  context: Context;
  isOwner: boolean;
  ownerName: string;
  tasks: Task[];
}

export async function getSharedContextView(
  userId: string,
  contextId: string,
): Promise<SharedContextView> {
  const owned = await contextRepo.findContextById(contextId, userId);
  if (owned) {
    const owner = await findUserById(userId);
    const tasks = await taskRepo.listTasksByContext(contextId);
    return { context: owned, isOwner: true, ownerName: owner?.full_name ?? '', tasks };
  }

  const share = await shareRepo.findShare(contextId, userId);
  if (!share) throw new NotFoundError('Context not found');

  const context = await contextRepo.findContextByIdUnscoped(contextId);
  if (!context) throw new NotFoundError('Context not found');

  const owner = await findUserById(context.user_id);
  const tasks = await taskRepo.listTasksByContext(contextId);
  return { context, isOwner: false, ownerName: owner?.full_name ?? '', tasks };
}
