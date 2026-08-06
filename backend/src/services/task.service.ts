import * as taskRepo from '../repositories/task.repository';
import * as contextRepo from '../repositories/context.repository';
import { listActivityForTask, logActivity } from '../repositories/activity-log.repository';
import { startOfWeekLocal, todayLocalISODate } from '../utils/date';
import { createNaturalLanguageParser } from './parser-factory.service';
import { createContext as createContextRecord } from './context.service';
import { NotFoundError } from './context.service';
import { ActivityLog, Task, TaskPriority, TaskStatus } from '../types/domain';

const parser = createNaturalLanguageParser();

export interface TaskListQuery {
  status?: TaskStatus;
  contextId?: string;
  scheduledDate?: string;
  priority?: TaskPriority;
  excludeCompleted?: boolean;
  page: number;
  pageSize: number;
}

export async function getTasks(userId: string, query: TaskListQuery): Promise<Task[]> {
  const pageSize = Math.min(query.pageSize, 100);
  return taskRepo.listTasks(userId, {
    status: query.status,
    contextId: query.contextId,
    scheduledDate: query.scheduledDate,
    priority: query.priority,
    excludeCompleted: query.excludeCompleted,
    limit: pageSize,
    offset: (Math.max(query.page, 1) - 1) * pageSize,
  });
}

export async function getTask(id: string, userId: string): Promise<Task> {
  const task = await taskRepo.findTaskById(id, userId);
  if (!task) throw new NotFoundError('Task not found');
  return task;
}

export async function getTaskActivity(id: string, userId: string): Promise<ActivityLog[]> {
  const task = await taskRepo.findTaskById(id, userId);
  if (!task) throw new NotFoundError('Task not found');
  return listActivityForTask(id, 50);
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  contextId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  dueDate?: string | null;
  sourceRef?: string | null;
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
    dueDate: input.dueDate ?? null,
    sourceRef: input.sourceRef ?? null,
  });
  await logActivity({ userId, taskId: task.id, action: 'created' });
  return task;
}

async function resolveParsedContext(
  userId: string,
  contextId: string | null,
  contextName: string | null,
): Promise<string | null> {
  if (contextId) return contextId;
  if (!contextName) return null;
  const created = await createContextRecord(userId, { name: contextName, colorHex: '#7C3AED' });
  return created.id;
}

export interface CapturePreview {
  title: string;
  description: string | null;
  contextId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDate: string | null;
  scheduledTime: string | null;
}

export async function previewCaptureFromNaturalLanguage(
  userId: string,
  rawInput: string,
): Promise<CapturePreview> {
  const contexts = await contextRepo.listContexts(userId);
  const parsed = await parser.parse(rawInput, contexts, userId);
  const contextId = await resolveParsedContext(userId, parsed.contextId, parsed.contextName);

  return {
    title: parsed.title,
    description: null,
    contextId,
    status: parsed.scheduledDate ? 'today' : 'inbox',
    priority: parsed.priority,
    scheduledDate: parsed.scheduledDate,
    scheduledTime: parsed.scheduledTime,
  };
}

export async function createTaskFromNaturalLanguage(
  userId: string,
  rawInput: string,
): Promise<Task> {
  const preview = await previewCaptureFromNaturalLanguage(userId, rawInput);
  const task = await taskRepo.createTask({
    userId,
    contextId: preview.contextId,
    title: preview.title,
    description: preview.description,
    status: preview.status,
    priority: preview.priority,
    scheduledDate: preview.scheduledDate,
    scheduledTime: preview.scheduledTime,
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
  dueDate?: string | null;
  sourceRef?: string | null;
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
  const task = await taskRepo.findTaskById(id, userId);
  if (!task) throw new NotFoundError('Task not found');
  await logActivity({ userId, taskId: id, action: 'deleted' });
  await taskRepo.deleteTask(id, userId);
}

/**
 * Corre una vez por día (ver server.ts, más una corrida al arrancar): una
 * tarea en "Próximamente" con fecha pasa sola a "Hoy" apenas llega (o ya
 * pasó) esa fecha, sin que el usuario tenga que moverla a mano.
 */
export async function promoteDueUpcomingTasks(): Promise<number> {
  const promoted = await taskRepo.promoteDueUpcomingTasks(todayLocalISODate());
  for (const task of promoted) {
    await logActivity({ userId: task.user_id, taskId: task.id, action: 'updated' });
  }
  return promoted.length;
}

export interface DashboardSummary {
  urgentCount: number;
  scheduledCount: number;
  inboxCount: number;
  overdueCount: number;
  completedThisWeekCount: number;
  todayTasks: Task[];
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const today = todayLocalISODate();
  const [urgentCount, statusCounts, overdueCount, completedThisWeekCount, todayTasks] =
    await Promise.all([
      taskRepo.countUrgentTasks(userId),
      taskRepo.countTasksByStatus(userId),
      taskRepo.countOverdueTasks(userId, today),
      taskRepo.countCompletedSince(userId, startOfWeekLocal()),
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
    overdueCount,
    completedThisWeekCount,
    todayTasks: Array.from(merged.values()),
  };
}
