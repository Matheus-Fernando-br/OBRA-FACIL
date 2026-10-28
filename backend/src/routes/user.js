import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Client from '../models/Client.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import Produto from '../models/Produto.js';
import UserModel from '../models/User.js';
import { deleteUserAccount } from '../services/accounts.js';
import { audit } from '../services/audit.js';
import { sendNoticeEmailSafe } from '../services/mail.js';
import { createSession, revokeAllSessions } from '../services/tokens.js';
import { conflict, notFound, unauthorized } from '../utils/errors.js';
import { onlyDigits } from '../utils/documents.js';
import { sha256 } from '../utils/crypto.js';
import { deleteUserSchema, updateUserSchema } from '../validators/schemas.js';
import { hashPassword } from './auth.js';

const router = Router();
router.use(requireAuth);

/** Só a própria conta: /user/:id com outro id responde 404. */
function ownAccount(req, _res, next) {
  if (req.params.id !== String(req.user._id)) return next(notFound('Usuário não encontrado.'));
  next();
}

router.get('/me', (req, res) => res.json(req.user));

/** Portabilidade (LGPD): todos os dados da conta em JSON. */
router.get('/me/export', async (req, res) => {
  const id = req.user._id;
  const [clientes, orcamentos, obras, produtos] = await Promise.all([
    Client.find({ responsavel: id }).lean(),
    Orcamento.find({ responsavel: id }).lean(),
    Obra.find({ responsavel: id }).lean(),
    Produto.find({ responsavel: id }).lean(),
  ]);
  res.setHeader('content-disposition', 'attachment; filename="obra-facil-meus-dados.json"');
  res.json({ exportadoEm: new Date(), usuario: req.user, clientes, orcamentos, obras, produtos });
});

router.get('/:id', ownAccount, (req, res) => res.json(req.user));

/**
 * Atualiza o perfil. Trocar senha ou e-mail exige a senha atual.
 * Trocar a senha encerra as outras sessões e devolve um token novo.
 */
router.put('/:id', ownAccount, validate(updateUserSchema), async (req, res) => {
  const user = req.user;
  const { senha, senhaAtual, email, ...rest } = req.body;
  const raw = req.rawBody ?? {};

  const mudaEmail = email && email !== user.email;
  if (senha || mudaEmail) {
    if (!senhaAtual) throw unauthorized('Informe sua senha atual para confirmar.', 'CURRENT_PASSWORD_REQUIRED');
    if (!(await bcrypt.compare(senhaAtual, user.senha))) {
      throw unauthorized('Senha atual incorreta.', 'WRONG_PASSWORD');
    }
  }

  if (mudaEmail) {
    if (await UserModel.exists({ email, _id: { $ne: user._id } })) throw conflict('Este e-mail já está em uso.', 'EMAIL_IN_USE');
    sendNoticeEmailSafe(user, 'Seu e-mail foi alterado — Obra Fácil', 'E-mail da conta alterado', [
      `Olá, ${user.nome}. O e-mail de acesso da sua conta foi alterado para ${email}.`,
      'Se não foi você, responda este e-mail ou fale com o suporte imediatamente.',
    ]);
    user.email = email;
  }

  if (rest.nome) user.nome = rest.nome;
  if (rest.preferencias?.tema) user.set('preferencias.tema', rest.preferencias.tema);
  if (rest.imagem_perfil !== undefined) user.imagem_perfil = rest.imagem_perfil;
  for (const doc of ['CPF', 'CNPJ']) {
    if (rest[doc]) user[doc] = onlyDigits(rest[doc]);
    else if (doc in raw && !raw[doc]) user[doc] = undefined;
  }

  let session;
  if (senha) {
    user.senha = await hashPassword(senha);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await revokeAllSessions(user._id);
    sendNoticeEmailSafe(user, 'Sua senha foi alterada — Obra Fácil', 'Senha alterada', [
      `Olá, ${user.nome}. A senha da sua conta foi alterada agora.`,
      'Se não foi você, use "Esqueci minha senha" no app e fale com o suporte.',
    ]);
  }

  await user.save();
  // Sessão nova para este aparelho (as outras foram encerradas).
  if (senha) session = await createSession(user, req.get('user-agent'));
  if (senha || mudaEmail) {
    await audit({
      ator: { tipo: 'usuario', id: String(user._id) },
      acao: senha ? 'usuario.senha_alterada' : 'usuario.email_alterado',
      alvo: { tipo: 'usuario', id: String(user._id) },
      ip: req.ip,
    });
  }

  const body = user.toJSON();
  // Após trocar a senha, o app recebe tokens novos (as sessões antigas foram encerradas).
  if (session) Object.assign(body, { accessToken: session.accessToken, refreshToken: session.refreshToken });
  res.json(body);
});

/**
 * Exclusão definitiva da conta e de todos os dados (exigência da Google Play
 * e LGPD). Pede a senha. Cobranças futuras são canceladas no Mercado Pago.
 */
router.delete('/:id', ownAccount, validate(deleteUserSchema), async (req, res) => {
  const user = req.user;
  if (!(await bcrypt.compare(req.body.senha, user.senha))) throw unauthorized('Senha incorreta.', 'WRONG_PASSWORD');

  const id = String(user._id);
  const totais = await deleteUserAccount(user);
  await audit({
    ator: { tipo: 'usuario', id: sha256(id).slice(0, 16) },
    acao: 'usuario.conta_excluida',
    detalhes: totais,
  });

  res.json({ message: 'Conta excluída com sucesso.' });
});

export default router;
