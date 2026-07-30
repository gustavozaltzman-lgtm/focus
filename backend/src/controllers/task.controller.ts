import { Response } from 'express';
import * as taskService from '../services/task.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error-handler.middleware';

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new AppError('Unauthenticated', 401);
  return req.user.userId;
}

export const listTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query as unknown as {
    status?: taskService.TaskListQuery['status'];
    contextId?: string;
    scheduledDate?: string;
    page: number;
    pageSize: number;
  };
  const tasks = await taskService.getTasks(requireUserId(req), query);
  res.status(200).json({ tasks });
});

export const getTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.getTask(req.params.id, requireUserId(req));
  res.status(200).json({ task });
});

export const getTaskActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const activity = await taskService.getTaskActivity(req.params.id, requireUserId(req));
  res.status(200).json({ activity });
});

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.createTask(requireUserId(req), req.body);
  res.status(201).json({ task });
});

export const quickCapture = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.createTaskFromNaturalLanguage(
    requireUserId(req),
    req.body.text,
  );
  res.status(201).json({ task });
});

export const previewCapture = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const preview = await taskService.previewCaptureFromNaturalLanguage(
    requireUserId(req),
    req.body.text,
  );
  res.status(200).json({ preview });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTask(req.params.id, requireUserId(req), req.body);
  res.status(200).json({ task });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await taskService.deleteTask(req.params.id, requireUserId(req));
  res.status(204).send();
});

export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const summary = await taskService.getDashboardSummary(requireUserId(req));
  res.status(200).json(summary);
});
