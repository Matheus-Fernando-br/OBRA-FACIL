import { Router } from 'express';
import logger from '../config/logger.js';
import { webhookLimiter } from '../middlewares/rateLimits.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { verifyWebhookSignature } from '../services/mercadopago.js';
import { handleAuthorizedPayment, handlePayment, syncPreapproval } from '../services/subscriptions.js';
import { notify } from '../services/telegram.js';

/*
 * Notificações do Mercado Pago. Configure no painel do Mercado Pago:
 *   URL: {PUBLIC_BASE_URL}/webhooks/mercadopago
 *   Eventos: Planos e assinaturas (subscription_preapproval,
 *   subscription_authorized_payment) e Pagamentos.
 *
 * 1. Valida a assinatura x-signature (HMAC com MP_WEBHOOK_SECRET).
 * 2. Descarta duplicadas (mesmo x-request-id).
 * 3. Consulta o recurso na API do Mercado Pago — o corpo da notificação
 *    nunca é usado para mudar plano.
 */
const router = Router();

const HANDLERS = {
  subscription_preapproval: syncPreapproval,
  preapproval: syncPreapproval,
  subscription_authorized_payment: handleAuthorizedPayment,
  authorized_payment: handleAuthorizedPayment,
  payment: handlePayment,
};

router.post('/mercadopago', webhookLimiter, async (req, res) => {
  const tipo = String(req.query.type ?? req.query.topic ?? req.body?.type ?? req.body?.topic ?? '');
  const dataId = String(req.query['data.id'] ?? req.query.id ?? req.body?.data?.id ?? '');
  const requestId = req.get('x-request-id') ?? '';
  const signature = req.get('x-signature') ?? '';

  const valid = verifyWebhookSignature({ signature, requestId, dataId });
  const dedupeKey = `mp:${tipo}:${dataId}:${requestId || signature}`;

  if (!valid) {
    logger.warn({ tipo, dataId }, 'Webhook do Mercado Pago com assinatura inválida');
    await WebhookEvent.create({
      dedupeKey: `${dedupeKey}:rejeitado:${Date.now()}`,
      tipo,
      dataId,
      requestId,
      assinaturaValida: false,
      status: 'rejeitado',
    }).catch(() => {});
    return res.status(401).json({ message: 'Assinatura inválida.' });
  }

  const handler = HANDLERS[tipo];
  if (!handler || !dataId) {
    await WebhookEvent.create({ dedupeKey, tipo, acao: req.body?.action, dataId, requestId, assinaturaValida: true, status: 'ignorado' }).catch(
      () => {},
    );
    return res.status(200).json({ ok: true, ignorado: true });
  }

  let event;
  try {
    event = await WebhookEvent.create({
      dedupeKey,
      tipo,
      acao: req.body?.action,
      dataId,
      requestId,
      assinaturaValida: true,
      status: 'recebido',
    });
  } catch (err) {
    if (err?.code === 11000) {
      const existing = await WebhookEvent.findOne({ dedupeKey }).lean();
      // Já processada: responde OK. Se falhou antes, processa de novo.
      if (existing?.status !== 'erro') return res.status(200).json({ ok: true, duplicado: true });
      event = await WebhookEvent.findOne({ dedupeKey });
    } else {
      throw err;
    }
  }

  try {
    const result = await handler(dataId);
    event.status = result?.resultado === 'ignorado' ? 'ignorado' : 'processado';
    event.processadoEm = new Date();
    event.erro = undefined;
    await event.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Recurso inexistente no Mercado Pago (ex.: "Simular notificação" do painel):
    // nada a fazer e não adianta o Mercado Pago reenviar.
    if (err?.providerStatus === 404) {
      event.status = 'ignorado';
      event.erro = 'Recurso não encontrado no Mercado Pago';
      event.processadoEm = new Date();
      await event.save();
      return res.status(200).json({ ok: true, ignorado: true });
    }
    event.status = 'erro';
    event.erro = String(err?.message ?? err).slice(0, 300);
    await event.save();
    logger.error({ err: err?.message, tipo, dataId }, 'Falha ao processar webhook');
    notify('erro_webhook', `⚠️ Falha ao processar webhook ${tipo} (${dataId})`);
    // 500 → o Mercado Pago tenta de novo mais tarde.
    return res.status(500).json({ message: 'Falha temporária.' });
  }
});

export default router;
