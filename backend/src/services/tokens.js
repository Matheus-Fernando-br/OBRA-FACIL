import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';
import { randomToken, sha256 } from '../utils/crypto.js';
import { unauthorized } from '../utils/errors.js';

/*
 * Access token: JWT curto (padrão 1 h) só com id e versão — nada de dados
 * pessoais no token. Refresh token: aleatório, opaco, guardado como hash e
 * trocado a cada uso (rotação com detecção de reuso).
 */

export function signAccessToken(user) {
  const env = getEnv();
  return jwt.sign({ tv: user.tokenVersion ?? 0 }, env.JWT_ACCESS_SECRET, {
    subject: String(user._id),
    expiresIn: env.ACCESS_TOKEN_TTL,
    audience: 'obra-facil-app',
    issuer: 'obra-facil-api',
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token) {
  const env = getEnv();
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    audience: 'obra-facil-app',
    issuer: 'obra-facil-api',
    algorithms: ['HS256'],
  });
}

export async function issueRefreshToken(userId, { familyId, userAgent } = {}) {
  const env = getEnv();
  const token = randomToken(48);
  await RefreshToken.create({
    userId,
    tokenHash: sha256(token),
    familyId: familyId ?? crypto.randomUUID(),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL * 1000),
    userAgent: userAgent?.slice(0, 200),
  });
  return token;
}

export async function createSession(user, userAgent) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: await issueRefreshToken(user._id, { userAgent }),
    expiresIn: getEnv().ACCESS_TOKEN_TTL,
  };
}

/**
 * Troca um refresh token por um par novo. Se o token já tinha sido trocado
 * (reuso), revoga toda a família — alguém pode ter copiado o token.
 */
export async function rotateRefreshToken(token, userAgent) {
  if (!token || typeof token !== 'string') throw unauthorized('Sessão expirada. Entre novamente.');
  const found = await RefreshToken.findOne({ tokenHash: sha256(token) });
  if (!found || found.expiresAt < new Date()) throw unauthorized('Sessão expirada. Entre novamente.');

  if (found.revokedAt || found.replacedAt) {
    await RefreshToken.updateMany({ familyId: found.familyId }, { $set: { revokedAt: new Date() } });
    throw unauthorized('Sessão encerrada por segurança. Entre novamente.', 'SESSION_REUSED');
  }

  found.replacedAt = new Date();
  await found.save();
  const next = await issueRefreshToken(found.userId, { familyId: found.familyId, userAgent });
  return { userId: found.userId, refreshToken: next };
}

export async function revokeRefreshToken(token) {
  if (!token) return;
  await RefreshToken.updateOne({ tokenHash: sha256(token) }, { $set: { revokedAt: new Date() } });
}

export async function revokeAllSessions(userId) {
  await RefreshToken.deleteMany({ userId });
}
