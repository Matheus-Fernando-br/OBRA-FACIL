import VerificationCode from '../models/VerificationCode.js';
import { hmac, safeEqual, sixDigitCode } from '../utils/crypto.js';
import { badRequest, tooMany } from '../utils/errors.js';

const TTL_MIN = 15;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SEC = 60;

/**
 * Cria um código novo (substitui o anterior do mesmo tipo).
 * `cooldown`: impede pedir outro código antes de 60 s.
 */
export async function createCode(userId, tipo, { cooldown = true } = {}) {
  if (cooldown) {
    const last = await VerificationCode.findOne({ userId, tipo }).sort({ createdAt: -1 }).lean();
    if (last && Date.now() - new Date(last.createdAt).getTime() < COOLDOWN_SEC * 1000) {
      throw tooMany('Aguarde 1 minuto para pedir um novo código.');
    }
  }
  const code = sixDigitCode();
  await VerificationCode.deleteMany({ userId, tipo });
  await VerificationCode.create({
    userId,
    tipo,
    codigoHash: hmac(`${tipo}:${userId}:${code}`),
    expiresAt: new Date(Date.now() + TTL_MIN * 60 * 1000),
  });
  return code;
}

/** Confere o código. Após 5 erros o código é invalidado. */
export async function consumeCode(userId, tipo, code) {
  const invalid = () => badRequest('Código inválido ou expirado.', 'INVALID_CODE');
  if (!userId) throw invalid();

  const doc = await VerificationCode.findOne({ userId, tipo }).sort({ createdAt: -1 });
  if (!doc || doc.expiresAt < new Date()) throw invalid();

  if (!safeEqual(doc.codigoHash, hmac(`${tipo}:${userId}:${code}`))) {
    doc.tentativas += 1;
    if (doc.tentativas >= MAX_ATTEMPTS) await doc.deleteOne();
    else await doc.save();
    throw invalid();
  }

  await VerificationCode.deleteMany({ userId, tipo });
}
