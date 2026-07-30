import * as contextRepo from '../repositories/context.repository';
import { Context } from '../types/domain';

export class NotFoundError extends Error {
  public statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export interface ContextWithCount extends Context {
  active_task_count: number;
}

export async function getContexts(userId: string): Promise<ContextWithCount[]> {
  const [contexts, counts] = await Promise.all([
    contextRepo.listContexts(userId),
    contextRepo.countTasksByContext(userId),
  ]);
  return contexts.map((context) => ({
    ...context,
    active_task_count: counts.get(context.id) ?? 0,
  }));
}

export async function getContext(id: string, userId: string): Promise<Context> {
  const context = await contextRepo.findContextById(id, userId);
  if (!context) throw new NotFoundError('Context not found');
  return context;
}

export async function createContext(
  userId: string,
  params: { name: string; colorHex: string },
): Promise<Context> {
  return contextRepo.createContext({ userId, name: params.name, colorHex: params.colorHex });
}

export async function updateContext(
  id: string,
  userId: string,
  params: { name?: string; colorHex?: string },
): Promise<Context> {
  const updated = await contextRepo.updateContext(id, userId, params);
  if (!updated) throw new NotFoundError('Context not found');
  return updated;
}

export async function deleteContext(id: string, userId: string): Promise<void> {
  const deleted = await contextRepo.deleteContext(id, userId);
  if (!deleted) throw new NotFoundError('Context not found');
}
