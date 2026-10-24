import logger from '../config/logger.js';
import { HttpError } from '../utils/errors.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Rota não encontrada.', code: 'ROUTE_NOT_FOUND' });
}

/**
 * Resposta de erro padrão: { message, code, ...extra }.
 * Erros inesperados viram 500 com mensagem genérica — detalhes só no log.
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) {
    if (err.status >= 500) req.log?.warn({ code: err.code }, err.message);
    return res.status(err.status).json({ message: err.message, code: err.code, ...(err.extra ?? {}) });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido.', code: 'INVALID_JSON' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Conteúdo muito grande.', code: 'PAYLOAD_TOO_LARGE' });
  }
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({ message: 'Dados inválidos.', code: 'VALIDATION' });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ message: 'Registro duplicado.', code: 'DUPLICATE' });
  }

  (req.log ?? logger).error({ err }, 'Erro inesperado');
  res.status(500).json({ message: 'Erro interno. Tente novamente em instantes.', code: 'INTERNAL' });
}
