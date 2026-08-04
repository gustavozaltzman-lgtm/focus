/**
 * Importa "fichas" (texto estructurado copiado de correos) desde un .txt a
 * tareas en Inbox. Ver `services/fichas-import.service.ts` para el formato
 * esperado y la logica de parseo/dedup (compartida con el endpoint
 * POST /tasks/import-fichas que usa el boton "Importar fichas" en Inbox).
 *
 * Uso:
 *   npx tsx src/scripts/import-fichas.ts "<ruta al .txt>" [email]
 *   (email por default: gustavo.zaltzman@gmail.com)
 */
import fs from 'fs';
import { pool } from '../config/db';
import { findUserByEmail } from '../repositories/user.repository';
import { importFichas } from '../services/fichas-import.service';

async function main(): Promise<void> {
  const filePath = process.argv[2];
  const email = (process.argv[3] ?? 'gustavo.zaltzman@gmail.com').toLowerCase();

  if (!filePath) {
    console.error('Uso: npx tsx src/scripts/import-fichas.ts "<ruta al .txt>" [email]');
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, 'utf-8');

  const user = await findUserByEmail(email);
  if (!user) {
    console.error(`No existe ningún usuario con email ${email}`);
    process.exit(1);
  }

  const result = await importFichas(user.id, text);
  for (const title of result.createdTitles) {
    console.log(`+ ${title}`);
  }
  console.log(`\n${result.created} tareas nuevas creadas, ${result.skipped} ya existían (salteadas).`);
}

main()
  .catch((error) => {
    console.error('Import falló:', error);
    process.exit(1);
  })
  .finally(() => pool.end());
