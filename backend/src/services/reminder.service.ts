import * as reminderRepo from '../repositories/reminder.repository';
import { findTaskById } from '../repositories/task.repository';
import { logActivity } from '../repositories/activity-log.repository';
import { NotFoundError } from './context.service';
import { AppError } from '../middlewares/error-handler.middleware';
import { Reminder } from '../types/domain';
import * as pushService from './push.service';

async function assertTaskOwnership(taskId: string, userId: string): Promise<void> {
  const task = await findTaskById(taskId, userId);
  if (!task) throw new NotFoundError('Task not found');
}

export async function createReminder(
  userId: string,
  taskId: string,
  triggerAt: string,
): Promise<Reminder> {
  await assertTaskOwnership(taskId, userId);
  const parsed = new Date(triggerAt);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Fecha/hora de recordatorio inválida', 422);
  }
  const reminder = await reminderRepo.createReminder(taskId, parsed);
  await logActivity({ userId, taskId, action: 'reminder_created' });
  return reminder;
}

export async function listRemindersForTask(userId: string, taskId: string): Promise<Reminder[]> {
  await assertTaskOwnership(taskId, userId);
  return reminderRepo.listRemindersForTask(taskId);
}

export async function listDueReminders(userId: string) {
  return reminderRepo.listDueRemindersForUser(userId, new Date());
}

export async function dismissReminder(userId: string, id: string): Promise<Reminder> {
  const reminder = await reminderRepo.findReminderForUser(id, userId);
  if (!reminder) throw new NotFoundError('Reminder not found');
  const updated = await reminderRepo.updateReminderStatus(id, 'sent');
  if (!updated) throw new NotFoundError('Reminder not found');
  return updated;
}

export async function snoozeReminder(
  userId: string,
  id: string,
  minutes: number,
): Promise<Reminder> {
  const reminder = await reminderRepo.findReminderForUser(id, userId);
  if (!reminder) throw new NotFoundError('Reminder not found');
  const newTriggerAt = new Date(Date.now() + minutes * 60_000);
  const updated = await reminderRepo.rescheduleReminder(id, newTriggerAt);
  if (!updated) throw new NotFoundError('Reminder not found');
  return updated;
}

export async function deleteReminder(userId: string, id: string): Promise<void> {
  const reminder = await reminderRepo.findReminderForUser(id, userId);
  if (!reminder) throw new NotFoundError('Reminder not found');
  await reminderRepo.deleteReminder(id);
}

/**
 * Entrega real de recordatorios: corre server-side asi que llega aunque la
 * app este cerrada, a diferencia del ReminderWatcher del cliente (que solo
 * funciona con la pestaña abierta y queda como fallback visual).
 */
export async function dispatchDueReminders(): Promise<number> {
  const due = await reminderRepo.listDuePendingRemindersGlobal(new Date());
  for (const reminder of due) {
    await pushService.sendToUser(reminder.user_id, {
      title: 'Focus — recordatorio',
      body: reminder.task_title,
      tag: `reminder-${reminder.id}`,
    });
    await reminderRepo.updateReminderStatus(reminder.id, 'sent');
  }
  return due.length;
}

const GRACE_PERIOD_MS = 10 * 60_000;

/**
 * Safety-net sweep, not the primary delivery path: the frontend polls
 * /reminders/due every ~20s while the app is open and dismisses reminders
 * itself. This only cleans up reminders nobody was around to see, after a
 * grace period, so it doesn't race the in-app notification.
 */
export async function sweepPendingReminders(): Promise<number> {
  const cutoff = new Date(Date.now() - GRACE_PERIOD_MS);
  const overdue = await reminderRepo.listPendingReminders(cutoff);
  for (const reminder of overdue) {
    await reminderRepo.updateReminderStatus(reminder.id, 'sent');
  }
  return overdue.length;
}
