import crypto from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';

/*
 * Ambiente de teste: banco MongoDB descartável e credenciais aleatórias
 * geradas a cada execução (nenhum segredo fica no código).
 * - TEST_MONGO_URI: usa um mongod já em execução (um banco novo por arquivo);
 * - senão, sobe um mongodb-memory-server (precisa baixar o binário).
 */
let memoryServer;
const rand = (n = 32) => crypto.randomBytes(n).toString('hex');

export async function setupTestApp({ adminPassword } = {}) {
  const dbName = `of_test_${rand(4)}`;
  let uri;
  if (process.env.TEST_MONGO_URI) {
    uri = `${process.env.TEST_MONGO_URI.replace(/\/$/, '')}/${dbName}`;
  } else {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri(dbName);
  }

  Object.assign(process.env, {
    NODE_ENV: 'test',
    MONGO_URI: uri,
    JWT_ACCESS_SECRET: rand(),
    JWT_REFRESH_SECRET: rand(),
    ADMIN_JWT_SECRET: rand(),
    SETTINGS_ENCRYPTION_KEY: rand(),
    PUBLIC_BASE_URL: 'https://api.teste.local',
    MP_ACCESS_TOKEN: `TEST-${rand(8)}`,
    MP_WEBHOOK_SECRET: rand(16),
    BREVO_API_KEY: rand(8),
    MAIL_FROM_EMAIL: 'no-reply@teste.local',
    DISABLE_JOBS: 'true',
  });
  if (adminPassword) process.env.ADMIN_INITIAL_PASSWORD = adminPassword;

  const { connectDatabase } = await import('../src/config/db.js');
  const { runMigrations } = await import('../src/migrations/index.js');
  const { createApp } = await import('../src/app.js');
  const { setMailTransport } = await import('../src/services/mail.js');
  const { setTelegramSender } = await import('../src/services/telegram.js');

  await connectDatabase(uri);
  await runMigrations();

  const mails = [];
  setMailTransport(async (msg) => {
    mails.push(msg);
    return {};
  });
  const telegrams = [];
  setTelegramSender(async (_token, _chat, text) => telegrams.push(text));

  const app = createApp();
  return { app, mails, telegrams, api: () => request(app) };
}

export async function teardown() {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.disconnect();
  await memoryServer?.stop();
}

export const VALID_CPF = '52998224725';
export const VALID_CPF_2 = '11144477735';

/** Cadastra, verifica o e-mail e faz login. Retorna tokens e usuário. */
export async function createUser(ctx, { email = `u${rand(3)}@teste.com`, senha = 'senha123', nome = 'Usuário Teste' } = {}) {
  const api = ctx.api;
  const reg = await api().post('/auth/register').send({ nome, email, senha, CPF: VALID_CPF, aceiteTermos: true, versaoTermos: '2026-10-19' });
  if (reg.status !== 201) throw new Error(`register ${reg.status} ${JSON.stringify(reg.body)}`);
  const code = [...ctx.mails].reverse().find((m) => m.to === email && m.tipo === 'verificacao_email').code;
  const ver = await api().post('/auth/verify-email').send({ email, codigo: code });
  if (ver.status !== 200) throw new Error(`verify ${ver.status}`);
  const login = await api().post('/auth/login').send({ email, senha });
  if (login.status !== 200) throw new Error(`login ${login.status}`);
  return { email, senha, ...login.body, auth: { Authorization: `Bearer ${login.body.accessToken}` } };
}
