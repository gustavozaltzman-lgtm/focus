import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(255),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createContextSchema = z.object({
  name: z.string().min(1).max(120),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#6366F1'),
});

export const updateContextSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

const statusEnum = z.enum(['inbox', 'today', 'upcoming', 'someday', 'completed']);
const priorityEnum = z.enum(['low', 'medium', 'high']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).nullish(),
  contextId: z.string().uuid().nullish(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  scheduledTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .transform((value) => value.slice(0, 5))
    .nullish(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const quickCaptureSchema = z.object({
  text: z.string().min(1).max(1000),
});

export const webauthnRegisterVerifySchema = z.object({
  response: z.record(z.any()),
  deviceName: z.string().max(120).nullish(),
});

export const webauthnAuthOptionsSchema = z.object({
  email: z.string().email(),
});

export const webauthnAuthVerifySchema = z.object({
  email: z.string().email(),
  response: z.record(z.any()),
});

export const createReminderSchema = z.object({
  taskId: z.string().uuid(),
  triggerAt: z.string().min(1),
});

export const snoozeReminderSchema = z.object({
  minutes: z.number().int().min(1).max(10080),
});

export const reminderQuerySchema = z.object({
  taskId: z.string().uuid(),
});

export const shareContextSchema = z.object({
  email: z.string().email(),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export const taskQuerySchema = z.object({
  status: statusEnum.optional(),
  contextId: z.string().uuid().optional(),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  priority: priorityEnum.optional(),
  excludeCompleted: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
