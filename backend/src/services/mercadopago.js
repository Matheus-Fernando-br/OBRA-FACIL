import crypto from 'node:crypto';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';
import { safeEqual } from '../utils/crypto.js';
import { HttpError } from '../utils/errors.js';

/*
 * Cliente HTTP mínimo da API do Mercado Pago (assinaturas = "preapproval").
 * Documentação: https://www.mercadopago.com.br/developers/pt/reference/subscriptions
 *
 * Variáveis: MP_ACCESS_TOKEN (credencial de produção APP_USR-… ou de teste
 * TEST-…), MP_WEBHOOK_SECRET (assinatura secreta das notificações, em
 * Suas integrações → Webhooks).
 */

const BASE = 'https://api.mercadopago.com';

export function isMercadoPagoConfigured() {
  return Boolean(getEnv().MP_ACCESS_TOKEN);
}

async function request(method, path, body, { idempotencyKey } = {}) {
  const token = getEnv().MP_ACCESS_TOKEN;
  if (!token) throw new HttpError(503, 'Pagamentos indisponíveis no momento.', 'PAYMENTS_NOT_CONFIGURED');

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
  } catch (cause) {
    logger.error({ path, err: cause?.message }, 'Mercado Pago inacessível');
    throw new HttpError(503, 'Não foi possível falar com o Mercado Pago agora. Tente novamente em alguns minutos.', 'PAYMENT_PROVIDER_UNREACHABLE');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    logger.error({ status: res.status, path, mp: { message: data?.message, error: data?.error } }, 'Mercado Pago recusou');
    const err = new HttpError(502, 'O Mercado Pago não respondeu como esperado. Tente novamente.', 'PAYMENT_PROVIDER_ERROR');
    err.providerStatus = res.status;
    err.providerMessage = String(data?.message ?? data?.error ?? '');
    throw err;
  }
  return data;
}

const realClient = {
  createPreapproval: (body, idempotencyKey) => request('POST', '/preapproval', body, { idempotencyKey }),
  getPreapproval: (id) => request('GET', `/preapproval/${encodeURIComponent(id)}`),
  cancelPreapproval: (id) => request('PUT', `/preapproval/${encodeURIComponent(id)}`, { status: 'cancelled' }),
  getAuthorizedPayment: (id) => request('GET', `/authorized_payments/${encodeURIComponent(id)}`),
  getPayment: (id) => request('GET', `/v1/payments/${encodeURIComponent(id)}`),
  whoami: () => request('GET', '/users/me'),
};

let client = realClient;

/** Testes substituem o cliente por um simulado. */
export function setMercadoPagoClient(mock) {
  client = mock ?? realClient;
}

export const mp = new Proxy({}, { get: (_t, key) => client[key] });

/**
 * Valida o cabeçalho x-signature do webhook (HMAC-SHA256):
 * manifest = "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 * Partes ausentes são omitidas, conforme a documentação do Mercado Pago.
 */
export function verifyWebhookSignature({ signature, requestId, dataId, secret = getEnv().MP_WEBHOOK_SECRET }) {
  if (!secret || !signature) return false;

  const parts = Object.fromEntries(
    String(signature)
      .split(',')
      .map((p) => p.split('=').map((s) => s.trim()))
      .filter(([k, v]) => k && v),
  );
  if (!parts.ts || !parts.v1) return false;

  const id = dataId && /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId;
  let manifest = '';
  if (id) manifest += `id:${id};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${parts.ts};`;

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return safeEqual(expected, parts.v1);
}

/** Gera uma assinatura válida (usado nos testes e no diagnóstico). */
export function signWebhook({ dataId, requestId, ts = Date.now(), secret = getEnv().MP_WEBHOOK_SECRET }) {
  const id = dataId && /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId;
  const manifest = `${id ? `id:${id};` : ''}${requestId ? `request-id:${requestId};` : ''}ts:${ts};`;
  return `ts=${ts},v1=${crypto.createHmac('sha256', secret).update(manifest).digest('hex')}`;
}
