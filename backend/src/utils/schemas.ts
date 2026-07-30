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
    .regex(/^\d{2}:\d{2}$/)
    .nullish(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const quickCaptureSchema = z.object({
  text: z.string().min(1).max(1000),
});

export const taskQuerySchema = z.object({
  status: statusEnum.optional(),
  contextId: z.string().uuid().optional(),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
