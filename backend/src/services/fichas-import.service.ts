import * as taskRepo from '../repositories/task.repository';
import { logActivity } from '../repositories/activity-log.repository';
import { TaskPriority } from '../types/domain';

export interface ParsedFicha {
  title: string;
  description: string | null;
  priority: TaskPriority;
}

export interface ImportResult {
  created: number;
  skipped: number;
  createdTitles: string[];
}

function mapPriority(raw: string | undefined): TaskPriority {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'alta') return 'high';
  if (normalized === 'baja') return 'low';
  return 'medium';
}

/**
 * Parsea texto con fichas copiadas de correos, formato repetido:
 *   FICHA <n>  (también acepta "FICHA #<n>")
 *   Título: ...
 *   Descripción: ...
 *   Prioridad: Alta|Media|Baja
 */
export function parseFichas(text: string): ParsedFicha[] {
  const blocks = text.split(/^FICHA\s+#?\d+\s*$/m).slice(1);
  const fichas: ParsedFicha[] = [];

  for (const block of blocks) {
    const titleMatch = block.match(/Título:\s*(.+)/i);
    const descMatch = block.match(/Descripción:\s*([\s\S]*?)(?=\n\s*Prioridad:|$)/i);
    const priorityMatch = block.match(/Prioridad:\s*(\w+)/i);

    const title = titleMatch?.[1]?.trim();
    if (!title) continue;

    fichas.push({
      title,
      description: descMatch?.[1]?.trim().replace(/\s+/g, ' ') || null,
      priority: mapPriority(priorityMatch?.[1]),
    });
  }

  return fichas;
}

/**
 * Crea una tarea en Inbox por cada ficha nueva. Idempotente: si ya existe
 * una tarea con el mismo título (sin importar mayúsculas) para el usuario,
 * la saltea — así se puede correr de nuevo sobre el mismo texto sin
 * duplicar lo ya importado.
 */
export async function importFichas(userId: string, text: string): Promise<ImportResult> {
  const fichas = parseFichas(text);

  const existingTasks = await taskRepo.listTasks(userId, { limit: 500, offset: 0 });
  const existingTitles = new Set(existingTasks.map((t) => t.title.trim().toLowerCase()));

  const result: ImportResult = { created: 0, skipped: 0, createdTitles: [] };

  for (const ficha of fichas) {
    if (existingTitles.has(ficha.title.toLowerCase())) {
      result.skipped++;
      continue;
    }

    const task = await taskRepo.createTask({
      userId,
      contextId: null,
      title: ficha.title,
      description: ficha.description,
      status: 'inbox',
      priority: ficha.priority,
      scheduledDate: null,
      scheduledTime: null,
    });
    await logActivity({ userId, taskId: task.id, action: 'created' });
    existingTitles.add(ficha.title.toLowerCase());
    result.created++;
    result.createdTitles.push(ficha.title);
  }

  return result;
}
