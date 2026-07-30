import * as taskRepo from '../repositories/task.repository';
import * as contextRepo from '../repositories/context.repository';
import { logActivity } from '../repositories/activity-log.repository';
import { todayLocalISODate } from '../utils/date';
import { createNaturalLanguageParser } from './parser-factory.service';
import { createContext as createContextRecord } from './context.service';
import { NotFoundError } from './context.service';
import { Task, TaskPriority, TaskStatus } from '../types/domain';

const parser = createNaturalLanguageParser();

export interface TaskListQuery {
  status?: TaskStatus;
  contextId?: string;
  scheduledDate?: string;
  page: number;
  pageSize: number;
}

export async function getTasks(userId: string, query: TaskListQuery): Promise<Task[]> {
  const pageSize = Math.min(query.pageSize, 100);
  return taskRepo.listTasks(userId, {
    status: query.status,
    contextId: query.contextId,
    scheduledDate: query.scheduledDate,
    limit: pageSize,
    offset: (Math.max(query.page, 1) - 1) * pageSize,
  });
}

export async function getTask(id: string, userId: string): Promise<Task> {
  const task = await taskRepo.findTaskById(id, userId);
  if (!task) throw new NotFoundError('Task not found');
  return task;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  contextId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const task = await taskRepo.createTask({
    userId,
    contextId: input.contextId ?? null,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? 'inbox',
    priority: input.priority ?? 'medium',
    scheduledDate: input.scheduledDate ?? null,
    scheduledTime: input.scheduledTime ?? null,
  });
  await logActivity({ userId, taskId: task.id, action: 'created' });
  return task;
}

export async function createTaskFromNaturalLanguage(
  userId: string,
  rawInput: string,
): Promise<Task> {
  const contexts = await contextRepo.listContexts(userId);
  const parsed = await parser.parse(rawInput, contexts);

  let contextId = parsed.contextId;
  if (!contextId && parsed.contextName) {
    const created = await createContextRecord(userId, {
      name: parsed.contextName,
      colorHex: '#6366F1',
    });
    contextId = created.id;
  }

  const status: TaskStatus = parsed.scheduledDate ? 'today' : 'inbox';

  const task = await taskRepo.createTask({
    userId,
    contextId,
    title: parsed.title,
    description: null,
    status,
    priority: parsed.priority,
    scheduledDate: parsed.scheduledDate,
    scheduledTime: parsed.scheduledTime,
  });
  await logActivity({ userId, taskId: task.id, action: 'created_via_capture' });
  return task;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  contextId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
}

export async function updateTask(
  id: string,
  userId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const updated = await taskRepo.updateTask(id, userId, input);
  if (!updated) throw new NotFoundError('Task not found');
  await logActivity({
    userId,
    taskId: id,
    action: input.status === 'completed' ? 'completed' : 'updated',
  });
  return updated;
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const deleted = await taskRepo.deleteTask(id, userId);
  if (!deleted) throw new NotFoundError('Task not found');
  await logActivity({ userId, taskId: id, action: 'deleted' });
}

export interface DashboardSummary {
  urgentCount: number;
  scheduledCount: number;
  inboxCount: number;
  todayTasks: Task[];
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const today = todayLocalISODate();
  const [urgentCount, statusCounts, todayTasks] = await Promise.all([
    taskRepo.countUrgentTasks(userId),
    taskRepo.countTasksByStatus(userId),
    taskRepo.listTasks(userId, { status: undefined, scheduledDate: today, limit: 50, offset: 0 }),
  ]);

  const combinedToday = await taskRepo.listTasks(userId, {
    status: 'today',
    limit: 50,
    offset: 0,
  });

  const merged = new Map<string, Task>();
  for (const task of [...todayTasks, ...combinedToday]) {
    merged.set(task.id, task);
  }

  return {
    urgentCount,
    scheduledCount: statusCounts['upcoming'] ?? 0,
    inboxCount: statusCounts['inbox'] ?? 0,
    todayTasks: Array.from(merged.values()),
  };
}
