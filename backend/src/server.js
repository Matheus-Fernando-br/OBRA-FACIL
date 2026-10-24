import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { getEnv } from './config/env.js';
import logger from './config/logger.js';
import { runMigrations } from './migrations/index.js';
import { bootstrapAdmin } from './services/admins.js';
import { startJobs, stopJobs } from './services/jobs.js';

async function main() {
  const env = getEnv();
  await connectDatabase(env.MONGO_URI);
  await runMigrations();
  await bootstrapAdmin();

  const app = createApp();
  const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'Obra Fácil API no ar'));
  // Render encerra conexões ociosas em ~60 s; mantemos acima disso.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  if (!env.DISABLE_JOBS) startJobs();

  const shutdown = (signal) => {
    logger.info({ signal }, 'Encerrando');
    stopJobs();
    server.close(async () => {
      await disconnectDatabase().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => shutdown(s));
}

process.on('unhandledRejection', (err) => logger.error({ err }, 'Promise rejeitada sem tratamento'));

main().catch((err) => {
  logger.fatal({ err: { message: err.message } }, 'Falha ao iniciar');
  process.exit(1);
});
