import { DashboardSummary, Task, TaskPriority, TaskStatus } from '../types/domain';
import { apiClient } from './client';

export interface TaskQuery {
  status?: TaskStatus;
  contextId?: string;
  scheduledDate?: string;
  priority?: TaskPriority;
  excludeCompleted?: boolean;
  page?: number;
  pageSize?: number;
}

export async function fetchTasks(query: TaskQuery = {}): Promise<Task[]> {
  const { data } = await apiClient.get<{ tasks: Task[] }>('/tasks', { params: query });
  return data.tasks;
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/tasks/dashboard');
  return data;
}

export async function quickCapture(text: string): Promise<Task> {
  const { data } = await apiClient.post<{ task: Task }>('/tasks/capture', { text });
  return data.task;
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

export async function previewCapture(text: string): Promise<CapturePreview> {
  const { data } = await apiClient.post<{ preview: CapturePreview }>('/tasks/capture/preview', {
    text,
  });
  return data.preview;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  contextId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<{ task: Task }>('/tasks', payload);
  return data.task;
}

export async function updateTask(
  id: string,
  payload: Partial<CreateTaskPayload>,
): Promise<Task> {
  const { data } = await apiClient.patch<{ task: Task }>(`/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, { status: 'completed' });
}

export interface ImportFichasResult {
  created: number;
  skipped: number;
  createdTitles: string[];
}

export async function importFichas(text: string): Promise<ImportFichasResult> {
  const { data } = await apiClient.post<ImportFichasResult>('/tasks/import-fichas', { text });
  return data;
}
