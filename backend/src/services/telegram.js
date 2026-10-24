import logger from '../config/logger.js';
import { decryptSecret } from '../utils/crypto.js';
import { getSetting } from './settings.js';

/*
 * Notificações para a equipe via bot do Telegram (opcional).
 * Token e Chat ID são configurados no painel administrativo e o token fica
 * criptografado no banco. Falhas nunca interrompem a operação principal.
 */

let sender = telegramSend;

export function setTelegramSender(fn) {
  sender = fn ?? telegramSend;
}

async function telegramSend(botToken, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.description || `Telegram respondeu ${res.status}`);
  }
  return data;
}

/** Envia sem checar se o evento está habilitado (usado pelo teste do painel). */
export async function sendTelegramRaw(text, override) {
  const cfg = override ?? (await getSetting('telegram'));
  const token = override?.botTokenPlain ?? decryptSecret(cfg.botToken);
  if (!token || !cfg.chatId) throw new Error('Token ou Chat ID do Telegram não configurado.');
  return sender(token, cfg.chatId, text);
}

/** Notificação de evento; respeita "habilitado" e a lista de eventos. */
export async function notify(evento, text) {
  try {
    const cfg = await getSetting('telegram');
    if (!cfg.enabled || !cfg.botToken || !cfg.chatId) return;
    if (Array.isArray(cfg.eventos) && !cfg.eventos.includes(evento)) return;
    await sendTelegramRaw(`🏗️ Obra Fácil\n${text}`, cfg);
  } catch (err) {
    logger.warn({ err: err.message, evento }, 'Notificação do Telegram não enviada');
  }
}
