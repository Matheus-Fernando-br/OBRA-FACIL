import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';
import Admin from '../models/Admin.js';
import { audit, SYSTEM } from './audit.js';

export const ADMIN_COOKIE = 'of_admin';
export const ADMIN_SESSION_HOURS = 8;
export const ADMIN_MIN_PASSWORD = 10;

export const hashAdminPassword = (plain) => bcrypt.hash(plain, getEnv().isTest ? 4 : 12);

/**
 * Cria o administrador inicial na primeira inicialização, a partir de
 * ADMIN_USERNAME / ADMIN_INITIAL_PASSWORD (variáveis do Render).
 * Só o hash é salvo. Depois de criado, a variável é ignorada — remova-a do
 * Render após o primeiro acesso. Para recuperar o acesso, defina
 * ADMIN_FORCE_RESET=true junto com uma nova ADMIN_INITIAL_PASSWORD,
 * reinicie, entre e remova as duas variáveis.
 */
export async function bootstrapAdmin() {
  const env = getEnv();
  const username = env.ADMIN_USERNAME.toLowerCase();
  const existing = await Admin.findOne({ username });

  if (existing && !env.ADMIN_FORCE_RESET) return { created: false };

  const password = env.ADMIN_INITIAL_PASSWORD;
  if (!password) {
    if (!existing) logger.warn('Nenhum administrador criado: defina ADMIN_INITIAL_PASSWORD no Render.');
    return { created: false };
  }
  if (password.length < ADMIN_MIN_PASSWORD) {
    logger.error(`ADMIN_INITIAL_PASSWORD precisa ter pelo menos ${ADMIN_MIN_PASSWORD} caracteres.`);
    return { created: false };
  }

  const senhaHash = await hashAdminPassword(password);
  if (existing) {
    existing.set({ senhaHash, mustChangePassword: true, failedAttempts: 0, lockedUntil: undefined });
    existing.tokenVersion += 1;
    await existing.save();
    await audit({ ator: SYSTEM, acao: 'admin.senha_redefinida_por_variavel', alvo: { tipo: 'admin', id: String(existing._id) } });
    logger.warn('Senha do administrador redefinida por ADMIN_FORCE_RESET. Remova a variável do Render.');
    return { created: false, reset: true };
  }

  const admin = await Admin.create({ username, senhaHash, mustChangePassword: true });
  await audit({ ator: SYSTEM, acao: 'admin.criado', alvo: { tipo: 'admin', id: String(admin._id) } });
  logger.info('Administrador inicial criado. Troque a senha no primeiro acesso e remova ADMIN_INITIAL_PASSWORD.');
  return { created: true };
}

export function signAdminToken(admin) {
  return jwt.sign({ tv: admin.tokenVersion, typ: 'admin' }, getEnv().ADMIN_JWT_SECRET, {
    subject: String(admin._id),
    expiresIn: ADMIN_SESSION_HOURS * 3600,
    audience: 'obra-facil-admin',
    issuer: 'obra-facil-api',
    algorithm: 'HS256',
  });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, getEnv().ADMIN_JWT_SECRET, {
    audience: 'obra-facil-admin',
    issuer: 'obra-facil-api',
    algorithms: ['HS256'],
  });
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: getEnv().isProd,
    sameSite: 'strict',
    path: '/admin',
    maxAge: ADMIN_SESSION_HOURS * 3600 * 1000,
  };
}
