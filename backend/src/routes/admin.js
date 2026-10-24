import bcrypt from 'bcryptjs';
import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { getEnv } from '../config/env.js';
import { DEFAULT_PLANS, LIMIT_KEYS, PLAN_IDS } from '../config/plans.js';
import { requireAdmin, requireAdminHeader } from '../middlewares/adminAuth.js';
import { adminLoginLimiter } from '../middlewares/rateLimits.js';
import { validate, validId } from '../middlewares/validate.js';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';
import Client from '../models/Client.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import Payment from '../models/Payment.js';
import Produto from '../models/Produto.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { deleteUserAccount } from '../services/accounts.js';
import {
  ADMIN_COOKIE,
  ADMIN_MIN_PASSWORD,
  adminCookieOptions,
  hashAdminPassword,
  signAdminToken,
} from '../services/admins.js';
import { audit } from '../services/audit.js';
import { jobsStatus, runReconcileNow } from '../services/jobs.js';
import { isMailConfigured, sendMail } from '../services/mail.js';
import { isMercadoPagoConfigured, mp } from '../services/mercadopago.js';
import { getPlans, getUsage, resolveEffectivePlan } from '../services/plans.js';
import { getSetting, setSetting } from '../services/settings.js';
import { cancelSubscription, syncPreapproval } from '../services/subscriptions.js';
import { sendTelegramRaw } from '../services/telegram.js';
import { revokeAllSessions } from '../services/tokens.js';
import { decryptSecret, encryptSecret, maskSecret } from '../utils/crypto.js';
import { badRequest, forbidden, notFound, unauthorized } from '../utils/errors.js';

/*
 * API do painel administrativo (/admin/api). Sessão por cookie httpOnly
 * SameSite=Strict + cabeçalho X-Admin-Request obrigatório. Todas as ações
 * que alteram dados ficam registradas na auditoria.
 */
const router = Router();
router.use(requireAdminHeader);

const MAX_FAILED = 5;
let dummyHash;
const LOCK_MINUTES = 15;

const log = (req, acao, alvo, detalhes) => audit({ ator: req.adminActor, acao, alvo, detalhes, ip: req.ip });

const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  status: z.string().trim().max(30).optional(),
  plano: z.string().trim().max(30).optional(),
  verificado: z.enum(['sim', 'nao']).optional(),
  acao: z.string().trim().max(60).optional(),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ------------------------------------------------------------------ sessão

router.post(
  '/login',
  adminLoginLimiter,
  validate(z.object({ username: z.string().trim().toLowerCase().min(1).max(60), senha: z.string().min(1).max(200) })),
  async (req, res) => {
    const { username, senha } = req.body;
    const admin = await Admin.findOne({ username });
    const generic = unauthorized('Usuário ou senha incorretos.', 'INVALID_CREDENTIALS');

    if (!admin) {
      await bcrypt.compare(senha, (dummyHash ??= await hashAdminPassword('admin-inexistente')));
      await audit({ ator: { tipo: 'admin', nome: username }, acao: 'admin.login_falhou', ip: req.ip });
      throw generic;
    }
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw forbidden(`Acesso bloqueado por ${LOCK_MINUTES} minutos após várias tentativas.`, 'ADMIN_LOCKED');
    }
    if (!(await bcrypt.compare(senha, admin.senhaHash))) {
      admin.failedAttempts += 1;
      if (admin.failedAttempts >= MAX_FAILED) {
        admin.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
        admin.failedAttempts = 0;
      }
      await admin.save();
      await audit({ ator: { tipo: 'admin', id: String(admin._id), nome: admin.username }, acao: 'admin.login_falhou', ip: req.ip });
      throw generic;
    }

    admin.failedAttempts = 0;
    admin.lockedUntil = undefined;
    admin.lastLoginAt = new Date();
    await admin.save();
    await audit({ ator: { tipo: 'admin', id: String(admin._id), nome: admin.username }, acao: 'admin.login', ip: req.ip });

    res.cookie(ADMIN_COOKIE, signAdminToken(admin), adminCookieOptions());
    res.json({ username: admin.username, mustChangePassword: admin.mustChangePassword });
  },
);

router.post('/logout', (req, res) => {
  res.clearCookie(ADMIN_COOKIE, { ...adminCookieOptions(), maxAge: undefined });
  res.status(204).end();
});

router.get('/me', requireAdmin({ allowPasswordChange: true }), (req, res) => {
  res.json({ username: req.admin.username, mustChangePassword: req.admin.mustChangePassword, lastLoginAt: req.admin.lastLoginAt });
});

router.post(
  '/change-password',
  requireAdmin({ allowPasswordChange: true }),
  validate(
    z.object({
      senhaAtual: z.string().min(1, 'Informe a senha atual.').max(200),
      novaSenha: z
        .string()
        .min(ADMIN_MIN_PASSWORD, `A nova senha precisa ter pelo menos ${ADMIN_MIN_PASSWORD} caracteres.`)
        .max(200)
        .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Use letras e números na nova senha.'),
    }),
  ),
  async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    if (!(await bcrypt.compare(senhaAtual, req.admin.senhaHash))) throw unauthorized('Senha atual incorreta.', 'WRONG_PASSWORD');
    if (senhaAtual === novaSenha) throw badRequest('A nova senha deve ser diferente da atual.');

    req.admin.senhaHash = await hashAdminPassword(novaSenha);
    req.admin.mustChangePassword = false;
    req.admin.senhaAlteradaEm = new Date();
    req.admin.tokenVersion += 1;
    await req.admin.save();
    await log(req, 'admin.senha_alterada', { tipo: 'admin', id: String(req.admin._id) });

    res.cookie(ADMIN_COOKIE, signAdminToken(req.admin), adminCookieOptions());
    res.json({ ok: true });
  },
);

// Daqui para baixo: administrador autenticado e com senha já trocada.
router.use(requireAdmin());

// ------------------------------------------------------------------ dashboard

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function dailySeries(Model, since, match = {}) {
  const rows = await Model.aggregate([
    { $match: { ...match, createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Sao_Paulo' } }, total: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.total]));
}

router.get('/dashboard', async (_req, res) => {
  const d30 = daysAgo(29);
  const d7 = daysAgo(6);
  const m12 = new Date();
  m12.setMonth(m12.getMonth() - 11, 1);
  m12.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    novos7,
    novos30,
    verificados,
    bloqueados,
    porPlano,
    subsAtivas,
    inadimplentes,
    canceladas30,
    receita30,
    receitaMensal,
    totais,
    signups,
    orcamentosDia,
    ativos30,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: d7 } }),
    User.countDocuments({ createdAt: { $gte: d30 } }),
    User.countDocuments({ email_verificado: true }),
    User.countDocuments({ status: 'bloqueado' }),
    User.aggregate([{ $group: { _id: { $ifNull: ['$planoAtual', 'gratuito'] }, total: { $sum: 1 } } }]),
    Subscription.aggregate([{ $match: { status: 'ativa' } }, { $group: { _id: '$planoId', total: { $sum: 1 }, mrr: { $sum: '$valor' } } }]),
    Subscription.countDocuments({ status: 'ativa', inadimplenteDesde: { $ne: null } }),
    Subscription.countDocuments({ status: 'cancelada', canceladaEm: { $gte: d30 } }),
    Payment.aggregate([{ $match: { status: 'approved', data: { $gte: d30 } } }, { $group: { _id: null, total: { $sum: '$valor' } } }]),
    Payment.aggregate([
      { $match: { status: 'approved', data: { $gte: m12 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$data', timezone: 'America/Sao_Paulo' } }, total: { $sum: '$valor' } } },
    ]),
    Promise.all([Client.estimatedDocumentCount(), Orcamento.estimatedDocumentCount(), Obra.estimatedDocumentCount(), Produto.estimatedDocumentCount()]),
    dailySeries(User, d30),
    dailySeries(Orcamento, d30),
    User.countDocuments({ ultimoLoginEm: { $gte: d30 } }),
  ]);

  const dias = [];
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    dias.push(d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }));
  }
  const meses = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    meses.push(d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7));
  }
  const receitaPorMes = Object.fromEntries(receitaMensal.map((r) => [r._id, r.total]));
  const mrr = subsAtivas.reduce((s, r) => s + r.mrr, 0);
  const [clientes, orcamentos, obras, produtos] = totais;

  res.json({
    usuarios: { total: totalUsers, novos7, novos30, verificados, bloqueados, ativos30 },
    planos: Object.fromEntries(PLAN_IDS.map((id) => [id, porPlano.find((p) => p._id === id)?.total ?? 0])),
    assinaturas: {
      ativas: subsAtivas.reduce((s, r) => s + r.total, 0),
      porPlano: Object.fromEntries(subsAtivas.map((r) => [r._id, r.total])),
      inadimplentes,
      canceladas30,
    },
    receita: { mrr, ultimos30: receita30[0]?.total ?? 0, porMes: meses.map((m) => ({ mes: m, total: receitaPorMes[m] ?? 0 })) },
    uso: {
      clientes,
      orcamentos,
      obras,
      produtos,
      mediaOrcamentosPorUsuario: totalUsers ? +(orcamentos / totalUsers).toFixed(1) : 0,
    },
    series: {
      dias,
      cadastros: dias.map((d) => signups[d] ?? 0),
      orcamentos: dias.map((d) => orcamentosDia[d] ?? 0),
    },
  });
});

// ------------------------------------------------------------------ usuários

router.get('/users', validate(pageQuery, 'query'), async (req, res) => {
  const { page, limit, q, status, plano, verificado } = req.validQuery;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ nome: rx }, { email: rx }];
    if (mongoose.isValidObjectId(q)) filter.$or.push({ _id: q });
  }
  if (status) filter.status = status === 'ativo' ? { $ne: 'bloqueado' } : status;
  if (plano) filter.planoAtual = plano === 'gratuito' ? { $in: ['gratuito', null] } : plano;
  if (verificado) filter.email_verificado = verificado === 'sim' ? true : { $ne: true };

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('nome email planoAtual status email_verificado createdAt ultimoLoginEm planoManual')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/users/:id', validId(), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw notFound('Usuário não encontrado.');
  const [uso, assinaturas, pagamentos, eventos] = await Promise.all([
    getUsage(user._id),
    Subscription.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    Payment.find({ userId: user._id }).sort({ data: -1 }).limit(20).lean(),
    AuditLog.find({ 'alvo.id': String(user._id) }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);
  res.json({ usuario: user, uso, assinaturas, pagamentos, eventos });
});

router.patch(
  '/users/:id/status',
  validId(),
  validate(z.object({ status: z.enum(['ativo', 'bloqueado']), motivo: z.string().trim().max(300).optional() })),
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw notFound('Usuário não encontrado.');
    user.status = req.body.status;
    if (req.body.status === 'bloqueado') {
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
      await revokeAllSessions(user._id);
    }
    await user.save();
    await log(req, req.body.status === 'bloqueado' ? 'usuario.bloqueado' : 'usuario.desbloqueado', { tipo: 'usuario', id: String(user._id) }, { motivo: req.body.motivo });
    res.json(user);
  },
);

router.post(
  '/users/:id/plan',
  validId(),
  validate(
    z.object({
      planoId: z.enum(PLAN_IDS),
      ate: z.coerce.date().optional(),
      motivo: z.string().trim().min(3, 'Informe o motivo.').max(300),
    }),
  ),
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw notFound('Usuário não encontrado.');
    user.planoManual = { ...req.body, concedidoPor: req.admin.username, concedidoEm: new Date() };
    await user.save();
    await resolveEffectivePlan(user._id);
    await log(req, 'usuario.plano_cortesia', { tipo: 'usuario', id: String(user._id) }, req.body);
    res.json(await User.findById(user._id));
  },
);

router.delete('/users/:id/plan', validId(), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw notFound('Usuário não encontrado.');
  user.planoManual = undefined;
  await user.save();
  await resolveEffectivePlan(user._id);
  await log(req, 'usuario.plano_cortesia_removida', { tipo: 'usuario', id: String(user._id) });
  res.json(await User.findById(user._id));
});

router.post('/users/:id/logout-all', validId(), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw notFound('Usuário não encontrado.');
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();
  await revokeAllSessions(user._id);
  await log(req, 'usuario.sessoes_encerradas', { tipo: 'usuario', id: String(user._id) });
  res.json({ ok: true });
});

router.post('/users/:id/verify-email', validId(), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { email_verificado: true } }, { new: true });
  if (!user) throw notFound('Usuário não encontrado.');
  await log(req, 'usuario.email_verificado_manual', { tipo: 'usuario', id: String(user._id) });
  res.json(user);
});

/** Exclusão a pedido do titular (ex.: solicitação por e-mail). Exige digitar o e-mail. */
router.delete(
  '/users/:id',
  validId(),
  validate(z.object({ confirmacao: z.string().trim().toLowerCase(), motivo: z.string().trim().max(300).optional() })),
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw notFound('Usuário não encontrado.');
    if (req.body.confirmacao !== user.email) throw badRequest('Digite o e-mail do usuário para confirmar.');
    const totais = await deleteUserAccount(user);
    await log(req, 'usuario.excluido_pelo_admin', { tipo: 'usuario', id: String(user._id) }, { ...totais, motivo: req.body.motivo });
    res.json({ ok: true, ...totais });
  },
);

// ------------------------------------------------------------------ assinaturas e pagamentos

router.get('/subscriptions', validate(pageQuery, 'query'), async (req, res) => {
  const { page, limit, status, plano, q } = req.validQuery;
  const filter = {};
  if (status === 'inadimplente') {
    filter.status = 'ativa';
    filter.inadimplenteDesde = { $ne: null };
  } else if (status) filter.status = status;
  if (plano) filter.planoId = plano;
  if (q) {
    const users = await User.find({ $or: [{ email: new RegExp(escapeRegex(q), 'i') }, { nome: new RegExp(escapeRegex(q), 'i') }] }).distinct('_id');
    filter.$or = [{ userId: { $in: users } }, { providerId: q }];
  }
  const [items, total] = await Promise.all([
    Subscription.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'nome email').lean(),
    Subscription.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.post('/subscriptions/:id/sync', validId(), async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub?.providerId) throw notFound('Assinatura sem vínculo com o Mercado Pago.');
  const result = await syncPreapproval(sub.providerId);
  await log(req, 'assinatura.sincronizada', { tipo: 'assinatura', id: String(sub._id) }, result);
  res.json({ ...result, assinatura: await Subscription.findById(sub._id).lean() });
});

router.post('/subscriptions/:id/cancel', validId(), async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) throw notFound('Assinatura não encontrada.');
  await cancelSubscription(sub, `admin:${req.admin.username}`);
  await log(req, 'assinatura.cancelada_pelo_admin', { tipo: 'assinatura', id: String(sub._id) });
  res.json(await Subscription.findById(sub._id).lean());
});

router.get('/payments', validate(pageQuery, 'query'), async (req, res) => {
  const { page, limit, status } = req.validQuery;
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ data: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'nome email').lean(),
    Payment.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// ------------------------------------------------------------------ planos

router.get('/plans', async (_req, res) => {
  res.json({ plans: await getPlans(), padrao: DEFAULT_PLANS, limites: LIMIT_KEYS });
});

const limitValue = z.union([z.coerce.number().int().min(0).max(1_000_000), z.null()]);

router.put(
  '/plans/:id',
  validate(
    z.object({
      nome: z.string().trim().min(2).max(40).optional(),
      descricao: z.string().trim().max(200).optional(),
      preco: z.coerce.number().min(0).max(10000).optional(),
      destaque: z.boolean().optional(),
      disponivel: z.boolean().optional(),
      limites: z.object(Object.fromEntries(LIMIT_KEYS.map((k) => [k, limitValue.optional()]))).optional(),
    }),
  ),
  async (req, res) => {
    const id = req.params.id;
    if (!PLAN_IDS.includes(id)) throw notFound('Plano não encontrado.');
    if (id === 'gratuito' && req.body.preco) throw badRequest('O plano Gratuito não pode ter preço.');
    const current = await getSetting('plans');
    const next = { ...current, [id]: { ...(current[id] ?? {}), ...req.body, limites: { ...(current[id]?.limites ?? {}), ...(req.body.limites ?? {}) } } };
    await setSetting('plans', next, req.admin.username);
    await log(req, 'plano.alterado', { tipo: 'plano', id }, req.body);
    res.json({ plans: await getPlans() });
  },
);

// ------------------------------------------------------------------ cobrança, integrações e configurações

router.get('/settings/billing', async (_req, res) => res.json(await getSetting('billing')));

router.put(
  '/settings/billing',
  validate(
    z.object({
      checkoutAndroid: z.boolean().optional(),
      checkoutIos: z.boolean().optional(),
      checkoutWeb: z.boolean().optional(),
      diasTolerancia: z.coerce.number().int().min(0).max(30).optional(),
    }),
  ),
  async (req, res) => {
    const value = await setSetting('billing', req.body, req.admin.username);
    await log(req, 'configuracao.cobranca_alterada', { tipo: 'configuracao', id: 'billing' }, req.body);
    res.json(value);
  },
);

function mpMode() {
  const token = getEnv().MP_ACCESS_TOKEN;
  if (!token) return null;
  return token.startsWith('TEST-') ? 'teste' : 'producao';
}

router.get('/integrations', async (_req, res) => {
  const env = getEnv();
  const telegram = await getSetting('telegram');
  let telegramToken;
  try {
    telegramToken = maskSecret(decryptSecret(telegram.botToken));
  } catch {
    telegramToken = 'erro ao ler (chave de criptografia mudou?)';
  }
  res.json({
    email: { provedor: 'Brevo', configurado: isMailConfigured(), remetente: env.MAIL_FROM_EMAIL ?? null, nome: env.MAIL_FROM_NAME },
    mercadopago: {
      configurado: isMercadoPagoConfigured(),
      modo: mpMode(),
      webhookSecretConfigurado: Boolean(env.MP_WEBHOOK_SECRET),
      webhookUrl: `${env.PUBLIC_BASE_URL}/webhooks/mercadopago`,
      retornoUrl: `${env.PUBLIC_BASE_URL}/assinar/retorno`,
    },
    telegram: { enabled: telegram.enabled, chatId: telegram.chatId, token: telegramToken, eventos: telegram.eventos },
  });
});

router.post('/integrations/email/test', validate(z.object({ para: z.email('E-mail inválido.') })), async (req, res) => {
  await sendMail({
    to: req.body.para,
    tipo: 'teste',
    subject: 'Teste de envio — Obra Fácil',
    text: 'Se você recebeu este e-mail, o envio pelo Brevo está funcionando.',
    html: '<p>Se você recebeu este e-mail, o envio pelo Brevo está funcionando. ✅</p>',
  });
  await log(req, 'integracao.email_teste', { tipo: 'integracao', id: 'brevo' });
  res.json({ ok: true, message: 'E-mail de teste enviado.' });
});

router.post('/integrations/mercadopago/test', async (req, res) => {
  const me = await mp.whoami();
  await log(req, 'integracao.mercadopago_teste', { tipo: 'integracao', id: 'mercadopago' });
  res.json({ ok: true, conta: { id: me.id, apelido: me.nickname, site: me.site_id }, modo: mpMode() });
});

router.put(
  '/integrations/telegram',
  validate(
    z.object({
      enabled: z.boolean().optional(),
      botToken: z
        .string()
        .trim()
        .max(200)
        .regex(/^\d+:[\w-]{20,}$/, 'Token do bot inválido (formato 123456:ABC...).')
        .optional()
        .or(z.literal('')),
      chatId: z.string().trim().max(40).regex(/^-?\d+$|^@\w+$/, 'Chat ID inválido.').optional().or(z.literal('')),
      eventos: z.array(z.string().max(40)).max(20).optional(),
    }),
  ),
  async (req, res) => {
    const patch = { ...req.body };
    if (patch.botToken === '') patch.botToken = null;
    else if (patch.botToken) patch.botToken = encryptSecret(patch.botToken);
    if (patch.chatId === '') patch.chatId = null;
    await setSetting('telegram', patch, req.admin.username);
    await log(req, 'integracao.telegram_alterado', { tipo: 'integracao', id: 'telegram' }, { ...req.body, botToken: req.body.botToken ? '[alterado]' : undefined });
    res.json({ ok: true });
  },
);

router.post('/integrations/telegram/test', async (req, res) => {
  try {
    await sendTelegramRaw('✅ Teste do painel do Obra Fácil');
  } catch (err) {
    throw badRequest(`Telegram: ${err.message}`, 'TELEGRAM_FAILED');
  }
  await log(req, 'integracao.telegram_teste', { tipo: 'integracao', id: 'telegram' });
  res.json({ ok: true, message: 'Mensagem enviada.' });
});

// ------------------------------------------------------------------ diagnóstico

router.get('/diagnostics', async (_req, res) => {
  const env = getEnv();
  const started = Date.now();
  let dbOk;
  try {
    await mongoose.connection.db.admin().ping();
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const pingMs = Date.now() - started;
  const collections = {};
  for (const [nome, Model] of Object.entries({ usuarios: User, clientes: Client, orcamentos: Orcamento, obras: Obra, produtos: Produto, assinaturas: Subscription, pagamentos: Payment })) {
    collections[nome] = await Model.estimatedDocumentCount();
  }
  const [webhooks24h, webhookErros24h, ultimoWebhook] = await Promise.all([
    WebhookEvent.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
    WebhookEvent.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) }, status: { $in: ['erro', 'rejeitado'] } }),
    WebhookEvent.findOne().sort({ createdAt: -1 }).lean(),
  ]);

  const vars = {
    obrigatorias: ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ADMIN_JWT_SECRET', 'SETTINGS_ENCRYPTION_KEY', 'PUBLIC_BASE_URL'],
    opcionais: ['BREVO_API_KEY', 'MAIL_FROM_EMAIL', 'MP_ACCESS_TOKEN', 'MP_WEBHOOK_SECRET', 'CORS_ORIGINS', 'ADMIN_INITIAL_PASSWORD'],
  };
  const presenca = (list) => Object.fromEntries(list.map((k) => [k, Boolean(process.env[k] && String(process.env[k]).trim())]));

  res.json({
    servidor: {
      ambiente: env.NODE_ENV,
      node: process.version,
      uptimeSeg: Math.round(process.uptime()),
      memoriaMb: Math.round(process.memoryUsage().rss / 1048576),
      urlPublica: env.PUBLIC_BASE_URL,
    },
    banco: { ok: dbOk, pingMs, colecoes: collections },
    variaveis: { obrigatorias: presenca(vars.obrigatorias), opcionais: presenca(vars.opcionais) },
    avisos: [
      ...(process.env.ADMIN_INITIAL_PASSWORD ? ['Remova ADMIN_INITIAL_PASSWORD do Render (o administrador já foi criado).'] : []),
      ...(process.env.ADMIN_FORCE_RESET === 'true' ? ['Remova ADMIN_FORCE_RESET do Render.'] : []),
      ...(!isMailConfigured() ? ['E-mail não configurado: cadastro e recuperação de senha não funcionam.'] : []),
      ...(isMercadoPagoConfigured() && !env.MP_WEBHOOK_SECRET ? ['MP_WEBHOOK_SECRET ausente: notificações do Mercado Pago serão recusadas.'] : []),
      ...(env.PUBLIC_BASE_URL.startsWith('http://') && env.isProd ? ['PUBLIC_BASE_URL deve usar https.'] : []),
    ],
    webhooks: { ultimas24h: webhooks24h, falhas24h: webhookErros24h, ultimo: ultimoWebhook?.createdAt ?? null },
    rotinas: jobsStatus(),
  });
});

router.post('/jobs/reconcile', async (req, res) => {
  const resumo = await runReconcileNow();
  await log(req, 'rotina.reconciliacao_manual', { tipo: 'rotina', id: 'reconcile' }, resumo);
  res.json(resumo);
});

// ------------------------------------------------------------------ auditoria e webhooks

router.get('/audit', validate(pageQuery, 'query'), async (req, res) => {
  const { page, limit, acao, q } = req.validQuery;
  const filter = {};
  if (acao) filter.acao = new RegExp(`^${escapeRegex(acao)}`);
  if (q) filter.$or = [{ 'ator.nome': new RegExp(escapeRegex(q), 'i') }, { 'alvo.id': q }];
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/webhooks', validate(pageQuery, 'query'), async (req, res) => {
  const { page, limit, status } = req.validQuery;
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    WebhookEvent.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    WebhookEvent.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export default router;
