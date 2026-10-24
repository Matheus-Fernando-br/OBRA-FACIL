import User from '../models/User.js';
import { verifyAccessToken } from '../services/tokens.js';
import { forbidden, unauthorized } from '../utils/errors.js';

/**
 * Exige "Authorization: Bearer <accessToken>". Carrega o usuário do banco
 * a cada requisição: contas excluídas, bloqueadas ou com senha trocada
 * (tokenVersion) perdem o acesso na hora.
 * Token ausente, inválido ou expirado → 401 (o app tenta renovar a sessão).
 */
export async function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized('Faça login para continuar.'));

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(unauthorized('Sessão expirada. Entre novamente.', 'TOKEN_EXPIRED'));
  }

  const user = await User.findById(payload.sub);
  if (!user || (user.tokenVersion ?? 0) !== (payload.tv ?? 0)) {
    return next(unauthorized('Sessão expirada. Entre novamente.', 'TOKEN_REVOKED'));
  }
  if (user.status === 'bloqueado') {
    return next(forbidden('Sua conta está bloqueada. Fale com o suporte.', 'ACCOUNT_BLOCKED'));
  }

  req.user = user;
  next();
}
