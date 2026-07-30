import { createApp } from './app';
import { env } from './config/env';
import { checkDbConnection } from './config/db';
import { sweepPendingReminders } from './services/reminder.service';

const REMINDER_SWEEP_INTERVAL_MS = 5 * 60_000;

async function main(): Promise<void> {
  await checkDbConnection();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Focus API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  setInterval(() => {
    sweepPendingReminders().catch((error) => {
      console.error('Reminder sweep failed:', error);
    });
  }, REMINDER_SWEEP_INTERVAL_MS);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
