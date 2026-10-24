import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';
import { unavailable } from '../utils/errors.js';

/*
 * E-mails transacionais pela API do Brevo (https://developers.brevo.com).
 * Usamos a API HTTP em vez de SMTP: não depende de portas liberadas no
 * Render e retorna erros claros.
 *
 * Variáveis: BREVO_API_KEY, MAIL_FROM_EMAIL (remetente verificado no Brevo),
 * MAIL_FROM_NAME.
 */

let transport = brevoTransport;

/** Usado pelos testes para capturar e-mails sem enviá-los. */
export function setMailTransport(fn) {
  transport = fn ?? brevoTransport;
}

export function isMailConfigured() {
  const env = getEnv();
  return Boolean(env.BREVO_API_KEY && env.MAIL_FROM_EMAIL);
}

async function brevoTransport({ to, subject, html, text, code }) {
  const env = getEnv();
  if (!isMailConfigured() && env.NODE_ENV === 'development') {
    // Desenvolvimento local sem Brevo: mostra o código no terminal.
    logger.warn({ to, subject, codigoDev: code }, 'E-mail NÃO enviado (BREVO_API_KEY ausente, modo desenvolvimento)');
    return {};
  }
  if (!isMailConfigured()) {
    throw unavailable('O envio de e-mails não está configurado. Tente novamente mais tarde.', 'MAIL_NOT_CONFIGURED');
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: env.MAIL_FROM_EMAIL, name: env.MAIL_FROM_NAME },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error({ status: res.status, body: body.slice(0, 300) }, 'Brevo recusou o envio');
    throw unavailable('Não foi possível enviar o e-mail agora. Tente novamente em instantes.', 'MAIL_FAILED');
  }
  return res.json().catch(() => ({}));
}

const escape = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout(title, body) {
  const support = escape(getEnv().SUPPORT_EMAIL);
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F5F5F7;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1C1C1E">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:16px;padding:32px">
<tr><td>
<div style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#C2570C;text-transform:uppercase">Obra Fácil</div>
<h1 style="font-size:22px;margin:8px 0 16px">${escape(title)}</h1>
${body}
<hr style="border:none;border-top:1px solid #E3E3E6;margin:28px 0 16px">
<p style="font-size:12px;color:#6B6B70;margin:0">E-mail automático do Obra Fácil (R2M). Dúvidas: ${support}</p>
</td></tr></table></td></tr></table></body></html>`;
}

function codeBlock(code) {
  return `<div style="font-size:32px;font-weight:700;letter-spacing:10px;text-align:center;padding:18px;margin:20px 0;background:#F5F5F7;border-radius:12px">${escape(code)}</div>`;
}

export async function sendMail(message) {
  return transport(message);
}

export function sendVerificationCodeEmail(user, code) {
  return sendMail({
    to: user.email,
    tipo: 'verificacao_email',
    code,
    subject: 'Seu código de verificação — Obra Fácil',
    text: `Olá, ${user.nome}! Seu código de verificação é ${code}. Ele vale por 15 minutos.`,
    html: layout(
      'Confirme seu e-mail',
      `<p>Olá, <strong>${escape(user.nome)}</strong>!</p><p>Use o código abaixo para confirmar seu e-mail:</p>${codeBlock(code)}<p style="color:#6B6B70">O código vale por 15 minutos. Se você não criou uma conta, ignore este e-mail.</p>`,
    ),
  });
}

export function sendPasswordResetEmail(user, code) {
  return sendMail({
    to: user.email,
    tipo: 'redefinir_senha',
    code,
    subject: 'Redefinição de senha — Obra Fácil',
    text: `Olá, ${user.nome}! Seu código para redefinir a senha é ${code}. Ele vale por 15 minutos.`,
    html: layout(
      'Redefinir sua senha',
      `<p>Olá, <strong>${escape(user.nome)}</strong>!</p><p>Recebemos um pedido para redefinir sua senha. Use o código:</p>${codeBlock(code)}<p style="color:#6B6B70">O código vale por 15 minutos. Se não foi você, ignore este e-mail — sua senha continua a mesma.</p>`,
    ),
  });
}

export function sendNoticeEmail(user, subject, title, paragraphs) {
  return sendMail({
    to: user.email,
    tipo: 'aviso',
    subject,
    text: paragraphs.join('\n\n'),
    html: layout(title, paragraphs.map((p) => `<p>${escape(p)}</p>`).join('')),
  });
}

/** Avisos não críticos: falha no envio só é registrada. */
export function sendNoticeEmailSafe(...args) {
  sendNoticeEmail(...args).catch((err) => logger.warn({ err: err.message }, 'Aviso por e-mail não enviado'));
}
