import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import * as taskRepo from '../repositories/task.repository';
import * as contextRepo from '../repositories/context.repository';
import { AppError } from '../middlewares/error-handler.middleware';
import { NotFoundError } from './context.service';
import { Task } from '../types/domain';

function requireClient(): Anthropic {
  if (!env.anthropicApiKey) {
    throw new AppError(
      'Esta función necesita Claude configurado (ANTHROPIC_API_KEY) y no está disponible ahora mismo.',
      503,
    );
  }
  return new Anthropic({ apiKey: env.anthropicApiKey });
}

const SUGGEST_TOOL_NAME = 'pick_next_actions';

const SUGGEST_TOOL = {
  name: SUGGEST_TOOL_NAME,
  description: 'Elige las 2 o 3 tareas más importantes para atacar ahora mismo, con una razón breve.',
  input_schema: {
    type: 'object' as const,
    properties: {
      taskIds: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 3,
        description: 'IDs de las tareas elegidas, de la lista provista, en orden de importancia.',
      },
      reasoning: {
        type: 'string',
        description: 'Explicación breve (2-3 frases, en español, tono directo) de por qué esas.',
      },
    },
    required: ['taskIds', 'reasoning'],
  },
};

interface SuggestToolInput {
  taskIds: string[];
  reasoning: string;
}

function isSuggestToolInput(value: unknown): value is SuggestToolInput {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.taskIds) && typeof candidate.reasoning === 'string';
}

export interface SuggestionResult {
  tasks: Task[];
  reasoning: string;
}

export async function suggestNextTasks(userId: string): Promise<SuggestionResult> {
  const client = requireClient();
  const candidates = await taskRepo.listTasks(userId, {
    excludeCompleted: true,
    limit: 60,
    offset: 0,
  });

  if (candidates.length === 0) {
    return { tasks: [], reasoning: 'No tenés tareas pendientes — nada que sugerir.' };
  }

  const contexts = await contextRepo.listContexts(userId);
  const contextById = new Map(contexts.map((c) => [c.id, c.name]));
  const today = new Date().toISOString().slice(0, 10);

  const summary = candidates.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    scheduledDate: t.scheduled_date,
    dueDate: t.due_date,
    context: t.context_id ? contextById.get(t.context_id) ?? null : null,
  }));

  const message = await client.messages.create({
    model: env.anthropicModel,
    max_tokens: 512,
    system:
      `Hoy es ${today}. Tenés una lista de tareas pendientes de un usuario, cada una con ` +
      'estado, prioridad, fecha planificada, fecha límite y contexto/proyecto. Elegí las 2 o 3 ' +
      'más importantes para hacer AHORA, priorizando: vencidas o por vencer, alta prioridad, y ' +
      'las que ya están en "today". Llamá a la herramienta pick_next_actions.',
    tools: [SUGGEST_TOOL],
    tool_choice: { type: 'tool', name: SUGGEST_TOOL_NAME },
    messages: [{ role: 'user', content: JSON.stringify(summary) }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
  );

  if (!toolUse || !isSuggestToolInput(toolUse.input)) {
    throw new AppError('No se pudo generar la sugerencia.', 502);
  }

  const chosenIds = new Set(toolUse.input.taskIds);
  const tasks = candidates.filter((t) => chosenIds.has(t.id));

  return { tasks, reasoning: toolUse.input.reasoning };
}

export async function draftFollowUp(userId: string, taskId: string): Promise<string> {
  const client = requireClient();
  const task = await taskRepo.findTaskById(taskId, userId);
  if (!task) throw new NotFoundError('Task not found');

  const message = await client.messages.create({
    model: env.anthropicModel,
    max_tokens: 400,
    system:
      'Redactás borradores cortos de emails de seguimiento en español, tono profesional y ' +
      'directo, para un profesional de ventas/negocios que acaba de resolver una tarea. No ' +
      'inventés datos que no te dieron (nombres, montos, fechas) más allá de lo que aparece en ' +
      'el título/descripción. Devolvé solo el texto del email, sin explicaciones extra.',
    messages: [
      {
        role: 'user',
        content: `Tarea completada: "${task.title}"${task.description ? `\nDetalle: ${task.description}` : ''}\n\nRedactá el borrador de seguimiento.`,
      },
    ],
  });

  const textBlock = message.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text',
  );

  if (!textBlock) {
    throw new AppError('No se pudo generar el borrador.', 502);
  }

  return textBlock.text.trim();
}
