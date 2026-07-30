import { apiClient } from './client';

export interface Reminder {
  id: string;
  task_id: string;
  trigger_at: string;
  status: 'pending' | 'sent' | 'snoozed';
  created_at: string;
}

export interface DueReminder extends Reminder {
  task_title: string;
}

export async function fetchRemindersForTask(taskId: string): Promise<Reminder[]> {
  const { data } = await apiClient.get<{ reminders: Reminder[] }>('/reminders', {
    params: { taskId },
  });
  return data.reminders;
}

export async function fetchDueReminders(): Promise<DueReminder[]> {
  const { data } = await apiClient.get<{ reminders: DueReminder[] }>('/reminders/due');
  return data.reminders;
}

export async function createReminder(taskId: string, triggerAt: string): Promise<Reminder> {
  const { data } = await apiClient.post<{ reminder: Reminder }>('/reminders', {
    taskId,
    triggerAt,
  });
  return data.reminder;
}

export async function dismissReminder(id: string): Promise<void> {
  await apiClient.post(`/reminders/${id}/dismiss`);
}

export async function snoozeReminder(id: string, minutes: number): Promise<void> {
  await apiClient.post(`/reminders/${id}/snooze`, { minutes });
}

export async function deleteReminder(id: string): Promise<void> {
  await apiClient.delete(`/reminders/${id}`);
}
