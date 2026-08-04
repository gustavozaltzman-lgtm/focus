import { createApp } from './app';
import { env } from './config/env';
import { checkDbConnection } from './config/db';
import { dispatchDueReminders, sweepPendingReminders } from './services/reminder.service';
import { promoteDueUpcomingTasks } from './services/task.service';

const REMINDER_SWEEP_INTERVAL_MS = 5 * 60_000;
const REMINDER_DISPATCH_INTERVAL_MS = 30_000;
const TASK_PROMOTION_INTERVAL_MS = 10 * 60_000;

async function main(): Promise<void> {
  await checkDbConnection();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Focus API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  setInterval(() => {
    dispatchDueReminders().catch((error) => {
      console.error('Reminder push dispatch failed:', error);
    });
  }, REMINDER_DISPATCH_INTERVAL_MS);

  setInterval(() => {
    sweepPendingReminders().catch((error) => {
      console.error('Reminder sweep failed:', error);
    });
  }, REMINDER_SWEEP_INTERVAL_MS);

  promoteDueUpcomingTasks().catch((error) => {
    console.error('Task promotion failed:', error);
  });
  setInterval(() => {
    promoteDueUpcomingTasks().catch((error) => {
      console.error('Task promotion failed:', error);
    });
  }, TASK_PROMOTION_INTERVAL_MS);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
