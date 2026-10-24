import crypto from 'node:crypto';
import { getEnv } from '../config/env.js';

export function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/** Hash com segredo (para códigos curtos, que seriam fáceis de quebrar com sha256 puro). */
export function hmac(value, secret = getEnv().JWT_REFRESH_SECRET) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** Código numérico de 6 dígitos com gerador criptográfico. */
export function sixDigitCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function settingsKey() {
  return crypto.createHash('sha256').update(getEnv().SETTINGS_ENCRYPTION_KEY).digest();
}

/** AES-256-GCM para segredos guardados no banco (ex.: token do Telegram). */
export function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', settingsKey(), iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':');
}

export function decryptSecret(payload) {
  if (!payload) return undefined;
  const [version, iv, tag, data] = String(payload).split(':');
  if (version !== 'v1') throw new Error('Formato de segredo desconhecido');
  const decipher = crypto.createDecipheriv('aes-256-gcm', settingsKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
}

/** "abc...xyz" — para exibir no painel que um segredo existe sem revelá-lo. */
export function maskSecret(value) {
  if (!value) return null;
  const s = String(value);
  return s.length <= 8 ? '••••' : `${s.slice(0, 4)}••••${s.slice(-4)}`;
}
