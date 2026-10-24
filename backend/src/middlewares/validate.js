import mongoose from 'mongoose';
import { badRequest, notFound } from '../utils/errors.js';

/**
 * Valida req.body/req.query com um schema zod. Campos desconhecidos são
 * descartados (evita que o app altere campos internos, como responsavel).
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first?.path?.join('.');
      return next(
        badRequest(first?.message || 'Dados inválidos.', 'VALIDATION', {
          campo: field || undefined,
        }),
      );
    }
    if (source === 'query') req.validQuery = result.data;
    else {
      req.rawBody = req[source];
      req[source] = result.data;
    }
    next();
  };
}

/** IDs inválidos viram 404 (não revelam nada sobre outros registros). */
export function validId(param = 'id') {
  return (req, _res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) return next(notFound());
    next();
  };
}
