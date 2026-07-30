import { createApp } from './app';
import { env } from './config/env';
import { checkDbConnection } from './config/db';

async function main(): Promise<void> {
  await checkDbConnection();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Focus API listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
