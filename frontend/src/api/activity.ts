import { apiClient } from './client';

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  action: string;
  created_at: string;
}

export async function fetchTaskActivity(taskId: string): Promise<ActivityLogEntry[]> {
  const { data } = await apiClient.get<{ activity: ActivityLogEntry[] }>(
    `/tasks/${taskId}/activity`,
  );
  return data.activity;
}
