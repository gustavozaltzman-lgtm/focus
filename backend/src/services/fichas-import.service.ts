import * as taskRepo from '../repositories/task.repository';
import * as contextRepo from '../repositories/context.repository';
import { logActivity } from '../repositories/activity-log.repository';
import { createContext } from './context.service';
import { TaskPriority, TaskStatus } from '../types/domain';

export interface ParsedFicha {
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string | null;
  contextName: string | null;
  sourceRef: string | null;
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

function mapStatus(raw: string | undefined): TaskStatus {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'hoy' || normalized === 'today') return 'today';
  if (['próximamente', 'proximamente', 'upcoming'].includes(normalized)) return 'upcoming';
  if (['algún día', 'algun dia', 'algún dia', 'algun día', 'someday'].includes(normalized)) return 'someday';
  if (['completada', 'completado', 'completed', 'hecho'].includes(normalized)) return 'completed';
  return 'inbox';
}

/** "06/08/2026" (DD/MM/YYYY) -> "2026-08-06" (ISO). null si no matchea el formato. */
function parseDateDMY(raw: string | undefined): string | null {
  const match = raw?.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

const FIELD_LABELS = 'Fecha|Contexto|Estado|Prioridad|Fuente';

/**
 * Parsea texto con fichas copiadas de correos, formato repetido:
 *   FICHA <n>  (también acepta "FICHA #<n>")
 *   Título: ...
 *   Descripción: ...
 *   Fecha: DD/MM/YYYY
 *   Contexto: ...
 *   Estado: Hoy|Inbox|Próximamente|Algún día
 *   Prioridad: Alta|Media|Baja
 *   Fuente: ...
 * Todos los campos salvo Título son opcionales.
 */
export function parseFichas(text: string): ParsedFicha[] {
  const blocks = text.split(/^FICHA\s+#?\d+\s*$/m).slice(1);
  const fichas: ParsedFicha[] = [];

  for (const block of blocks) {
    const titleMatch = block.match(/Título:\s*(.+)/i);
    const descMatch = block.match(
      new RegExp(`Descripción:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${FIELD_LABELS}):|$)`, 'i'),
    );
    const dateMatch = block.match(/Fecha:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const contextMatch = block.match(/Contexto:\s*(.+)/i);
    const statusMatch = block.match(/Estado:\s*(.+)/i);
    const priorityMatch = block.match(/Prioridad:\s*(\w+)/i);
    const sourceMatch = block.match(/Fuente:\s*(.+)/i);

    const title = titleMatch?.[1]?.trim();
    if (!title) continue;

    fichas.push({
      title,
      description: descMatch?.[1]?.trim().replace(/\s+/g, ' ') || null,
      priority: mapPriority(priorityMatch?.[1]),
      status: mapStatus(statusMatch?.[1]),
      scheduledDate: parseDateDMY(dateMatch?.[1]),
      contextName: contextMatch?.[1]?.trim() || null,
      sourceRef: sourceMatch?.[1]?.trim() || null,
    });
  }

  return fichas;
}

/**
 * Crea una tarea en Inbox por cada ficha nueva. Idempotente: si ya existe
 * una tarea con el mismo título (sin importar mayúsculas) para el usuario,
 * la saltea — así se puede correr de nuevo sobre el mismo texto sin
 * duplicar lo ya importado. Si la ficha trae un Contexto que no existe
 * todavía, lo crea (mismo criterio que el parser de captura con IA).
 */
export async function importFichas(userId: string, text: string): Promise<ImportResult> {
  const fichas = parseFichas(text);

  const [existingTasks, existingContexts] = await Promise.all([
    taskRepo.listTasks(userId, { limit: 500, offset: 0 }),
    contextRepo.listContexts(userId),
  ]);
  const existingTitles = new Set(existingTasks.map((t) => t.title.trim().toLowerCase()));
  const contextIdByName = new Map(existingContexts.map((c) => [c.name.toLowerCase(), c.id]));

  const result: ImportResult = { created: 0, skipped: 0, createdTitles: [] };

  for (const ficha of fichas) {
    if (existingTitles.has(ficha.title.toLowerCase())) {
      result.skipped++;
      continue;
    }

    let contextId: string | null = null;
    if (ficha.contextName) {
      const key = ficha.contextName.toLowerCase();
      contextId = contextIdByName.get(key) ?? null;
      if (!contextId) {
        const created = await createContext(userId, { name: ficha.contextName, colorHex: '#7C3AED' });
        contextId = created.id;
        contextIdByName.set(key, contextId);
      }
    }

    const task = await taskRepo.createTask({
      userId,
      contextId,
      title: ficha.title,
      description: ficha.description,
      status: ficha.status,
      priority: ficha.priority,
      scheduledDate: ficha.scheduledDate,
      scheduledTime: null,
      sourceRef: ficha.sourceRef,
    });
    await logActivity({ userId, taskId: task.id, action: 'created' });
    existingTitles.add(ficha.title.toLowerCase());
    result.created++;
    result.createdTitles.push(ficha.title);
  }

  return result;
}
