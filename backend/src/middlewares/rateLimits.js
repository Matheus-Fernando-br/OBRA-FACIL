import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { getEnv } from '../config/env.js';

/*
 * Limites de requisições (memória da instância — o serviço roda em uma
 * instância no Render). Com mais instâncias, troque por um store Redis.
 */
function limiter({ windowMin, max, key }) {
  return rateLimit({
    windowMs: windowMin * 60 * 1000,
    limit: () => (getEnv().isTest && !process.env.TEST_RATE_LIMIT ? 10_000 : max),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: key,
    message: { message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.', code: 'RATE_LIMIT' },
  });
}

const byIpAndEmail = (req) => `${ipKeyGenerator(req.ip ?? '')}|${String(req.body?.email ?? '').toLowerCase().trim()}`;

export const apiLimiter = limiter({ windowMin: 1, max: 300 });
export const loginLimiter = limiter({ windowMin: 15, max: 10, key: byIpAndEmail });
export const registerLimiter = limiter({ windowMin: 60, max: 10 });
export const codeLimiter = limiter({ windowMin: 15, max: 15, key: byIpAndEmail });
export const emailSendLimiter = limiter({ windowMin: 60, max: 5, key: byIpAndEmail });
export const checkEmailLimiter = limiter({ windowMin: 15, max: 30 });
export const adminLoginLimiter = limiter({ windowMin: 15, max: 10 });
export const webhookLimiter = limiter({ windowMin: 1, max: 120 });
/** Tentativas de pagamento (evita teste de cartões em massa). */
export const paymentLimiter = limiter({ windowMin: 60, max: 20 });
