/**
 * Erro com status HTTP e mensagem pronta para o usuário (em português).
 * `code` identifica o erro para o app (ex.: PLAN_LIMIT, EMAIL_NOT_VERIFIED).
 */
export class HttpError extends Error {
  constructor(status, message, code, extra) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export const badRequest = (msg = 'Dados inválidos.', code, extra) => new HttpError(400, msg, code, extra);
export const unauthorized = (msg = 'Sessão inválida ou expirada.', code) => new HttpError(401, msg, code);
export const forbidden = (msg = 'Acesso negado.', code, extra) => new HttpError(403, msg, code, extra);
export const notFound = (msg = 'Registro não encontrado.') => new HttpError(404, msg, 'NOT_FOUND');
export const conflict = (msg, code) => new HttpError(409, msg, code);
export const tooMany = (msg = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.') =>
  new HttpError(429, msg, 'RATE_LIMIT');
export const unavailable = (msg = 'Serviço temporariamente indisponível.', code) => new HttpError(503, msg, code);
