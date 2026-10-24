import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

const SENSITIVE = /senha|password|token|secret|codigo|cpf|cnpj/i;

/** Remove campos sensíveis antes de gravar detalhes na auditoria. */
function sanitize(value, depth = 0) {
  if (value == null || depth > 3) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => sanitize(v, depth + 1));
  if (typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE.test(k) ? '[oculto]' : sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Grava um evento de auditoria. Nunca lança erro (a operação principal
 * não deve falhar por causa do log).
 */
export async function audit({ ator, acao, alvo, detalhes, ip }) {
  try {
    await AuditLog.create({ ator, acao, alvo, detalhes: sanitize(detalhes), ip });
  } catch (err) {
    logger.error({ err, acao }, 'Falha ao gravar auditoria');
  }
}

export const SYSTEM = { tipo: 'sistema', nome: 'sistema' };
