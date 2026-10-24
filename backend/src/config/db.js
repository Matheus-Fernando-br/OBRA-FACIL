import mongoose from 'mongoose';
import logger from './logger.js';

export async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  // Índices são criados pelas migrações (src/migrations), não a cada boot.
  mongoose.set('autoIndex', false);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  logger.info('Conectado ao MongoDB');
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
