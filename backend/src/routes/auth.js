import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';
import {
  checkEmailLimiter,
  codeLimiter,
  emailSendLimiter,
  loginLimiter,
  registerLimiter,
} from '../middlewares/rateLimits.js';
import { validate } from '../middlewares/validate.js';
import User from '../models/User.js';
import { audit } from '../services/audit.js';
import { consumeCode, createCode } from '../services/codes.js';
import { sendPasswordResetEmail, sendVerificationCodeEmail } from '../services/mail.js';
import { notify } from '../services/telegram.js';
import { createSession, revokeAllSessions, revokeRefreshToken, rotateRefreshToken, signAccessToken } from '../services/tokens.js';
import { conflict, forbidden, unauthorized } from '../utils/errors.js';
import { onlyDigits } from '../utils/documents.js';
import {
  emailOnlySchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/schemas.js';

const router = Router();

export const hashPassword = (plain) => bcrypt.hash(plain, getEnv().isTest ? 4 : 12);
// Hash para comparar quando o e-mail não existe (tempo de resposta igual).
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await hashPassword('senha-inexistente'));

const userAgent = (req) => req.get('user-agent');

/** Cadastro: cria a conta (ainda não verificada) e envia o código por e-mail. */
router.post('/register', registerLimiter, validate(registerSchema), async (req, res) => {
  const { nome, email, senha, CPF, CNPJ, versaoTermos } = req.body;
  const docs = { CPF: CPF ? onlyDigits(CPF) : undefined, CNPJ: CNPJ ? onlyDigits(CNPJ) : undefined };
  const consent = { aceiteTermosEm: new Date(), versaoTermos: versaoTermos ?? 'sem-versao' };

  let user = await User.findOne({ email });
  let status = 201;

  if (user?.email_verificado) throw conflict('Já existe uma conta com este e-mail.', 'EMAIL_IN_USE');

  if (user) {
    // Cadastro anterior não concluído: atualiza os dados e reenvia o código.
    user.set({ nome, senha: await hashPassword(senha), ...docs, ...consent });
    await user.save();
    status = 200;
  } else {
    user = await User.create({ nome, email, senha: await hashPassword(senha), ...docs, ...consent });
    notify('novo_usuario', `Novo cadastro: ${nome}`);
  }

  const code = await createCode(user._id, 'verificacao_email', { cooldown: false });
  await sendVerificationCodeEmail(user, code);

  res.status(status).json({
    message: 'Enviamos um código de verificação para o seu e-mail.',
    email: user.email,
    emailVerificado: false,
  });
});

/** Usado no 1º passo do cadastro. Só contas verificadas contam como existentes. */
router.get('/check-email', checkEmailLimiter, validate(emailOnlySchema, 'query'), async (req, res) => {
  const exists = await User.exists({ email: req.validQuery.email, email_verificado: true });
  res.json({ exists: Boolean(exists) });
});

router.post('/verify-email', codeLimiter, validate(verifyEmailSchema), async (req, res) => {
  const { email, codigo } = req.body;
  const user = await User.findOne({ email });
  if (user?.email_verificado) {
    return res.json({ message: 'E-mail já verificado.', emailVerificado: true });
  }
  await consumeCode(user?._id, 'verificacao_email', codigo);
  user.email_verificado = true;
  await user.save();
  res.json({ message: 'E-mail verificado com sucesso.', emailVerificado: true });
});

router.post('/resend-verification-code', emailSendLimiter, validate(emailOnlySchema), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && !user.email_verificado) {
    const code = await createCode(user._id, 'verificacao_email');
    await sendVerificationCodeEmail(user, code);
  }
  res.json({ message: 'Se o cadastro estiver pendente, enviamos um novo código.' });
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(senha, user?.senha ?? (await getDummyHash()));
  if (!user || !ok) throw unauthorized('E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');

  if (user.status === 'bloqueado') throw forbidden('Sua conta está bloqueada. Fale com o suporte.', 'ACCOUNT_BLOCKED');

  if (!user.email_verificado) {
    try {
      const code = await createCode(user._id, 'verificacao_email');
      await sendVerificationCodeEmail(user, code);
    } catch (err) {
      logger.warn({ err: err.message }, 'Código não reenviado no login');
    }
    throw forbidden('Confirme seu e-mail para entrar. Enviamos um código para você.', 'EMAIL_NOT_VERIFIED', {
      email: user.email,
    });
  }

  user.ultimoLoginEm = new Date();
  await user.save();
  const session = await createSession(user, userAgent(req));
  res.json({ ...session, user });
});

/**
 * Renova a sessão. O app envia { refreshToken } no corpo.
 * Resposta 401 = sessão encerrada (o app volta para o login).
 */
router.post('/refresh', validate(refreshSchema), async (req, res) => {
  const token = req.body.refreshToken;
  const { userId, refreshToken } = await rotateRefreshToken(token, userAgent(req));
  const user = await User.findById(userId);
  if (!user || user.status === 'bloqueado') {
    await revokeAllSessions(userId);
    throw unauthorized('Sessão expirada. Entre novamente.');
  }
  res.json({ accessToken: signAccessToken(user), refreshToken, expiresIn: getEnv().ACCESS_TOKEN_TTL });
});

router.post('/logout', validate(refreshSchema), async (req, res) => {
  await revokeRefreshToken(req.body.refreshToken);
  res.status(204).end();
});

/** Sempre responde igual, exista ou não a conta (não revela e-mails cadastrados). */
router.post('/forgot-password', emailSendLimiter, validate(emailOnlySchema), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && user.status !== 'bloqueado') {
    try {
      const code = await createCode(user._id, 'redefinir_senha');
      await sendPasswordResetEmail(user, code);
    } catch (err) {
      // Pedido repetido em menos de 1 min: responde igual para não revelar a conta.
      if (err.status !== 429) throw err;
    }
  }
  res.json({ message: 'Se o e-mail estiver cadastrado, enviamos um código para redefinir a senha.' });
});

router.post('/reset-password', codeLimiter, validate(resetPasswordSchema), async (req, res) => {
  const { email, codigo, novaSenha } = req.body;
  const user = await User.findOne({ email });
  await consumeCode(user?._id, 'redefinir_senha', codigo);

  user.senha = await hashPassword(novaSenha);
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.email_verificado = true; // provou que recebe e-mails nesse endereço
  await user.save();
  await revokeAllSessions(user._id);
  await audit({ ator: { tipo: 'usuario', id: String(user._id) }, acao: 'usuario.senha_redefinida', alvo: { tipo: 'usuario', id: String(user._id) }, ip: req.ip });

  res.json({ message: 'Senha alterada. Entre com a nova senha.' });
});

export default router;
