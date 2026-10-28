import Setting from '../models/Setting.js';

/*
 * Configurações da plataforma editáveis pelo painel. Cache curto em memória
 * (o serviço roda em uma instância; o painel limpa o cache ao salvar).
 */
const DEFAULTS = {
  billing: {
    /** Checkout do Mercado Pago dentro do app, por plataforma. */
    checkoutAndroid: false,
    checkoutIos: false,
    checkoutWeb: true,
    /** Formas de pagamento na página /assinar. */
    pagamentoRecorrente: true,
    pagamentoAvulso: true,
    /** Dias de tolerância após falha de pagamento antes de voltar ao Gratuito. */
    diasTolerancia: 7,
  },
  plans: {},
  telegram: {
    enabled: false,
    botToken: null, // criptografado (utils/crypto.encryptSecret)
    chatId: null,
    eventos: ['novo_usuario', 'assinatura_ativada', 'pagamento_recusado', 'assinatura_cancelada', 'erro_webhook'],
  },
};

const cache = new Map();
const TTL_MS = 30_000;

export async function getSetting(key) {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.value;

  const doc = await Setting.findOne({ key }).lean();
  const value = { ...(DEFAULTS[key] ?? {}), ...(doc?.value ?? {}) };
  cache.set(key, { value, until: Date.now() + TTL_MS });
  return value;
}

export async function setSetting(key, patch, updatedBy) {
  const current = await getSetting(key);
  const value = { ...current, ...patch };
  await Setting.updateOne({ key }, { $set: { value, updatedBy } }, { upsert: true });
  cache.delete(key);
  return value;
}

export function clearSettingsCache() {
  cache.clear();
}
