import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';
import { runMigrations } from './index.js';

/* Executa as migrações manualmente: npm run migrate */
try {
  await connectDatabase(getEnv().MONGO_URI);
  await runMigrations();
  logger.info('Migrações concluídas');
  await disconnectDatabase();
} catch (err) {
  logger.error({ err }, 'Falha nas migrações');
  process.exit(1);
}
