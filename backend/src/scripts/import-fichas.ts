/**
 * Importa "fichas" (texto estructurado copiado de correos) desde un .txt a
 * tareas en Inbox. Formato esperado, repetido por ficha:
 *
 *   FICHA <n>
 *   Título: ...
 *   Descripción: ...
 *   Prioridad: Alta|Media|Baja
 *
 * Idempotente: si ya existe una tarea con el mismo título (sin importar
 * mayúsculas) para el usuario, la saltea — así se puede correr de nuevo
 * sobre el mismo archivo cada vez que se agregan fichas nuevas sin duplicar
 * las que ya se importaron.
 *
 * Uso:
 *   npx tsx src/scripts/import-fichas.ts "<ruta al .txt>" [email]
 *   (email por default: gustavo.zaltzman@gmail.com)
 */
import fs from 'fs';
import { pool } from '../config/db';
import { findUserByEmail } from '../repositories/user.repository';
import { createTask, listTasks } from '../repositories/task.repository';
import { logActivity } from '../repositories/activity-log.repository';
import { TaskPriority } from '../types/domain';

interface ParsedFicha {
  title: string;
  description: string | null;
  priority: TaskPriority;
}

function mapPriority(raw: string | undefined): TaskPriority {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'alta') return 'high';
  if (normalized === 'baja') return 'low';
  return 'medium';
}

function parseFichas(text: string): ParsedFicha[] {
  const blocks = text.split(/^FICHA\s+\d+\s*$/m).slice(1);
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

async function main(): Promise<void> {
  const filePath = process.argv[2];
  const email = (process.argv[3] ?? 'gustavo.zaltzman@gmail.com').toLowerCase();

  if (!filePath) {
    console.error('Uso: npx tsx src/scripts/import-fichas.ts "<ruta al .txt>" [email]');
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, 'utf-8');
  const fichas = parseFichas(text);

  if (fichas.length === 0) {
    console.log('No se encontraron fichas con el formato esperado (FICHA N / Título / Descripción / Prioridad).');
    return;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    console.error(`No existe ningún usuario con email ${email}`);
    process.exit(1);
  }

  const existingTasks = await listTasks(user.id, { limit: 500, offset: 0 });
  const existingTitles = new Set(existingTasks.map((t) => t.title.trim().toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const ficha of fichas) {
    if (existingTitles.has(ficha.title.toLowerCase())) {
      skipped++;
      continue;
    }

    const task = await createTask({
      userId: user.id,
      contextId: null,
      title: ficha.title,
      description: ficha.description,
      status: 'inbox',
      priority: ficha.priority,
      scheduledDate: null,
      scheduledTime: null,
    });
    await logActivity({ userId: user.id, taskId: task.id, action: 'created' });
    created++;
    console.log(`+ ${ficha.title} [${ficha.priority}]`);
  }

  console.log(`\n${created} tareas nuevas creadas, ${skipped} ya existían (salteadas).`);
}

main()
  .catch((error) => {
    console.error('Import falló:', error);
    process.exit(1);
  })
  .finally(() => pool.end());
