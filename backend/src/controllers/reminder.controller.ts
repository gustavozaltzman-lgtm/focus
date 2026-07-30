import { Response } from 'express';
import * as reminderService from '../services/reminder.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  return req.user.userId;
}

export const createReminder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reminder = await reminderService.createReminder(
    requireUserId(req),
    req.body.taskId,
    req.body.triggerAt,
  );
  res.status(201).json({ reminder });
});

export const listForTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reminders = await reminderService.listRemindersForTask(
    requireUserId(req),
    req.query.taskId as string,
  );
  res.status(200).json({ reminders });
});

export const listDue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reminders = await reminderService.listDueReminders(requireUserId(req));
  res.status(200).json({ reminders });
});

export const dismiss = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reminder = await reminderService.dismissReminder(requireUserId(req), req.params.id);
  res.status(200).json({ reminder });
});

export const snooze = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reminder = await reminderService.snoozeReminder(
    requireUserId(req),
    req.params.id,
    req.body.minutes,
  );
  res.status(200).json({ reminder });
});

export const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await reminderService.deleteReminder(requireUserId(req), req.params.id);
  res.status(204).send();
});
