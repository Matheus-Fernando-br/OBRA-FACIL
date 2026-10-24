import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createUser, setupTestApp, teardown } from './helpers.js';

let ctx;
const initialPassword = `Ini${crypto.randomBytes(6).toString('hex')}9`;
const newPassword = `Nova${crypto.randomBytes(6).toString('hex')}7`;
let agent;

before(async () => {
  ctx = await setupTestApp({ adminPassword: initialPassword });
  const { bootstrapAdmin } = await import('../src/services/admins.js');
  await bootstrapAdmin();
  agent = request.agent(ctx.app);
});
after(teardown);

const H = { 'X-Admin-Request': '1' };

describe('acesso ao painel', () => {
  it('senha guardada só como hash', async () => {
    const Admin = (await import('../src/models/Admin.js')).default;
    const admin = await Admin.findOne({ username: 'admin' }).lean();
    assert.ok(admin.senhaHash.startsWith('$2'));
    assert.ok(!JSON.stringify(admin).includes(initialPassword));
  });

  it('sem sessão, sem cabeçalho ou com token de usuário do app → negado', async () => {
    assert.equal((await ctx.api().get('/admin/api/dashboard').set(H)).status, 401);
    assert.equal((await ctx.api().get('/admin/api/dashboard')).status, 403, 'sem X-Admin-Request');
    const u = await createUser(ctx);
    const r = await ctx.api().get('/admin/api/users').set(H).set(u.auth);
    assert.equal(r.status, 401);
  });

  it('senha errada é recusada e bloqueia após 5 tentativas', async () => {
    const other = request.agent(ctx.app);
    for (let i = 0; i < 5; i++) {
      const r = await other.post('/admin/api/login').set(H).send({ username: 'admin', senha: 'errada' });
      assert.equal(r.status, 401);
    }
    const locked = await other.post('/admin/api/login').set(H).send({ username: 'admin', senha: initialPassword });
    assert.equal(locked.status, 403);
    assert.equal(locked.body.code, 'ADMIN_LOCKED');

    // Libera para os próximos testes.
    const Admin = (await import('../src/models/Admin.js')).default;
    await Admin.updateOne({ username: 'admin' }, { $unset: { lockedUntil: 1 }, $set: { failedAttempts: 0 } });
  });

  it('primeiro acesso exige trocar a senha inicial', async () => {
    let r = await agent.post('/admin/api/login').set(H).send({ username: 'admin', senha: initialPassword });
    assert.equal(r.status, 200);
    assert.equal(r.body.mustChangePassword, true);
    const cookie = r.headers['set-cookie'][0];
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);

    r = await agent.get('/admin/api/dashboard').set(H);
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'PASSWORD_CHANGE_REQUIRED');

    r = await agent.post('/admin/api/change-password').set(H).send({ senhaAtual: initialPassword, novaSenha: 'curta' });
    assert.equal(r.status, 400);
    r = await agent.post('/admin/api/change-password').set(H).send({ senhaAtual: initialPassword, novaSenha: newPassword });
    assert.equal(r.status, 200);

    r = await agent.get('/admin/api/dashboard').set(H);
    assert.equal(r.status, 200);
    assert.ok(r.body.usuarios.total >= 1);
    assert.equal(r.body.series.dias.length, 30);
  });

  it('variável de ambiente não recria nem altera o admin depois de criado', async () => {
    const { bootstrapAdmin } = await import('../src/services/admins.js');
    const res = await bootstrapAdmin();
    assert.equal(res.created, false);
    const r = await request(ctx.app).post('/admin/api/login').set(H).send({ username: 'admin', senha: newPassword });
    assert.equal(r.status, 200);
  });
});

describe('gestão', () => {
  it('lista, pesquisa, bloqueia e concede cortesia', async () => {
    const u = await createUser(ctx, { email: 'cliente-vip@teste.com', nome: 'Cliente VIP' });
    let r = await agent.get('/admin/api/users').query({ q: 'vip' }).set(H);
    assert.equal(r.status, 200);
    assert.equal(r.body.items.length, 1);
    assert.equal(r.body.items[0].senha, undefined);

    r = await agent.post(`/admin/api/users/${u.user._id}/plan`).set(H).send({ planoId: 'profissional', motivo: 'Parceria' });
    assert.equal(r.status, 200);
    let me = await ctx.api().get('/subscription/me').set(u.auth);
    assert.equal(me.body.plano.id, 'profissional');
    assert.equal(me.body.origem, 'cortesia');

    r = await agent.patch(`/admin/api/users/${u.user._id}/status`).set(H).send({ status: 'bloqueado', motivo: 'teste' });
    assert.equal(r.status, 200);
    me = await ctx.api().get('/user/me').set(u.auth);
    assert.equal(me.status, 401, 'sessões encerradas ao bloquear');
    const login = await ctx.api().post('/auth/login').send({ email: u.email, senha: u.senha });
    assert.equal(login.status, 403);
    assert.equal(login.body.code, 'ACCOUNT_BLOCKED');

    r = await agent.get(`/admin/api/users/${u.user._id}`).set(H);
    assert.equal(r.status, 200);
    assert.ok(r.body.eventos.some((e) => e.acao === 'usuario.bloqueado'));
  });

  it('planos editáveis refletem no app', async () => {
    let r = await agent.put('/admin/api/plans/gratuito').set(H).send({ limites: { obras: 5 } });
    assert.equal(r.status, 200);
    r = await ctx.api().get('/plans');
    assert.equal(r.body.plans.find((p) => p.id === 'gratuito').limites.obras, 5);
    r = await agent.put('/admin/api/plans/gratuito').set(H).send({ preco: 10 });
    assert.equal(r.status, 400);
  });

  it('Telegram: token salvo criptografado e nunca devolvido', async () => {
    const token = `123456:${crypto.randomBytes(20).toString('hex')}`;
    let r = await agent.put('/admin/api/integrations/telegram').set(H).send({ enabled: true, botToken: token, chatId: '-1001234' });
    assert.equal(r.status, 200);
    r = await agent.get('/admin/api/integrations').set(H);
    assert.notEqual(r.body.telegram.token, token);
    assert.ok(!JSON.stringify(r.body).includes(token));

    const Setting = (await import('../src/models/Setting.js')).default;
    const raw = await Setting.findOne({ key: 'telegram' }).lean();
    assert.ok(!JSON.stringify(raw).includes(token), 'criptografado no banco');

    r = await agent.post('/admin/api/integrations/telegram/test').set(H);
    assert.equal(r.status, 200);
    assert.ok(ctx.telegrams.some((t) => t.includes('Teste do painel')));
  });

  it('diagnóstico não revela valores de variáveis', async () => {
    const r = await agent.get('/admin/api/diagnostics').set(H);
    assert.equal(r.status, 200);
    assert.equal(r.body.banco.ok, true);
    assert.equal(r.body.variaveis.obrigatorias.MONGO_URI, true);
    const text = JSON.stringify(r.body);
    for (const k of ['MONGO_URI', 'JWT_ACCESS_SECRET', 'MP_ACCESS_TOKEN', 'MP_WEBHOOK_SECRET']) {
      assert.ok(!text.includes(process.env[k]), `${k} não aparece`);
    }
  });

  it('auditoria registra as ações do painel', async () => {
    const r = await agent.get('/admin/api/audit').set(H).query({ acao: 'usuario' });
    assert.equal(r.status, 200);
    assert.ok(r.body.items.some((e) => e.ator.nome === 'admin'));
    const all = JSON.stringify((await agent.get('/admin/api/audit').set(H).query({ limit: 100 })).body);
    assert.ok(!all.includes(newPassword) && !all.includes(initialPassword));
  });

  it('logout encerra a sessão do painel', async () => {
    await agent.post('/admin/api/logout').set(H);
    const r = await agent.get('/admin/api/me').set(H);
    assert.equal(r.status, 401);
  });
});
