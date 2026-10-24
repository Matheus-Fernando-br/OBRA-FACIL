import Admin from '../models/Admin.js';
import { ADMIN_COOKIE, verifyAdminToken } from '../services/admins.js';
import { forbidden, unauthorized } from '../utils/errors.js';

/**
 * Proteção CSRF: toda chamada à API do painel precisa do cabeçalho
 * X-Admin-Request (navegadores não enviam cabeçalhos customizados entre
 * sites sem permissão de CORS) — além do cookie SameSite=Strict.
 */
export function requireAdminHeader(req, _res, next) {
  if (req.get('x-admin-request') !== '1') return next(forbidden('Requisição não permitida.', 'CSRF'));
  next();
}

export function requireAdmin({ allowPasswordChange = false } = {}) {
  return async (req, _res, next) => {
    const token = req.cookies?.[ADMIN_COOKIE];
    if (!token) return next(unauthorized('Faça login no painel.', 'ADMIN_LOGIN_REQUIRED'));

    let payload;
    try {
      payload = verifyAdminToken(token);
    } catch {
      return next(unauthorized('Sessão do painel expirada.', 'ADMIN_LOGIN_REQUIRED'));
    }

    const admin = await Admin.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.tv) {
      return next(unauthorized('Sessão do painel expirada.', 'ADMIN_LOGIN_REQUIRED'));
    }
    if (admin.mustChangePassword && !allowPasswordChange) {
      return next(forbidden('Troque a senha inicial para continuar.', 'PASSWORD_CHANGE_REQUIRED'));
    }

    req.admin = admin;
    req.adminActor = { tipo: 'admin', id: String(admin._id), nome: admin.username };
    next();
  };
}
