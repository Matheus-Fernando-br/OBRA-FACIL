import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createUser, setupTestApp, teardown, VALID_CPF } from './helpers.js';

let ctx;
before(async () => {
  ctx = await setupTestApp();
});
after(teardown);

const lastCode = (email, tipo) => [...ctx.mails].reverse().find((m) => m.to === email && m.tipo === tipo)?.code;

describe('cadastro e verificação de e-mail', () => {
  it('exige aceite dos termos e documento válido', async () => {
    const base = { nome: 'Ana', email: 'ana@teste.com', senha: 'senha123', CPF: VALID_CPF };
    let r = await ctx.api().post('/auth/register').send(base);
    assert.equal(r.status, 400);
    assert.match(r.body.message, /Termos/);

    r = await ctx.api().post('/auth/register').send({ ...base, CPF: '11111111111', aceiteTermos: true });
    assert.equal(r.status, 400);
    assert.equal(r.body.message, 'CPF inválido.');

    r = await ctx.api().post('/auth/register').send({ ...base, CPF: '', aceiteTermos: true });
    assert.equal(r.status, 400);
    assert.match(r.body.message, /CPF ou CNPJ/);
  });

  it('cadastra, bloqueia login sem verificação e libera após o código', async () => {
    const email = 'bruno@teste.com';
    let r = await ctx.api().post('/auth/register').send({ nome: 'Bruno', email: 'Bruno@Teste.com ', senha: 'senha123', CPF: VALID_CPF, aceiteTermos: true });
    assert.equal(r.status, 201);
    assert.equal(r.body.email, email);

    r = await ctx.api().get('/auth/check-email').query({ email });
    assert.equal(r.body.exists, false, 'conta não verificada não conta como existente');

    r = await ctx.api().post('/auth/login').send({ email, senha: 'senha123' });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'EMAIL_NOT_VERIFIED');

    r = await ctx.api().post('/auth/verify-email').send({ email, codigo: '000000' });
    assert.equal(r.status, 400);

    r = await ctx.api().post('/auth/verify-email').send({ email, codigo: lastCode(email, 'verificacao_email') });
    assert.equal(r.status, 200);

    r = await ctx.api().get('/auth/check-email').query({ email });
    assert.equal(r.body.exists, true);

    r = await ctx.api().post('/auth/register').send({ nome: 'Outro', email, senha: 'senha123', CPF: VALID_CPF, aceiteTermos: true });
    assert.equal(r.status, 409);

    r = await ctx.api().post('/auth/login').send({ email, senha: 'errada' });
    assert.equal(r.status, 401);

    r = await ctx.api().post('/auth/login').send({ email, senha: 'senha123' });
    assert.equal(r.status, 200);
    assert.ok(r.body.accessToken && r.body.refreshToken);
    assert.equal(r.body.user.senha, undefined, 'hash da senha nunca é devolvido');
    assert.ok(r.body.user.aceiteTermosEm, 'aceite dos termos registrado');
  });

  it('código errado 5 vezes invalida o código', async () => {
    const email = 'carla@teste.com';
    await ctx.api().post('/auth/register').send({ nome: 'Carla', email, senha: 'senha123', CPF: VALID_CPF, aceiteTermos: true });
    const good = lastCode(email, 'verificacao_email');
    for (let i = 0; i < 5; i++) await ctx.api().post('/auth/verify-email').send({ email, codigo: '999999' === good ? '999998' : '999999' });
    const r = await ctx.api().post('/auth/verify-email').send({ email, codigo: good });
    assert.equal(r.status, 400);
  });
});

describe('sessão', () => {
  it('rota protegida exige token e responde 401', async () => {
    let r = await ctx.api().get('/user/me');
    assert.equal(r.status, 401);
    r = await ctx.api().get('/user/me').set('Authorization', 'Bearer token.invalido.x');
    assert.equal(r.status, 401);
  });

  it('refresh rotaciona o token e detecta reuso', async () => {
    const u = await createUser(ctx);
    const r1 = await ctx.api().post('/auth/refresh').send({ refreshToken: u.refreshToken });
    assert.equal(r1.status, 200);
    assert.ok(r1.body.accessToken);
    assert.notEqual(r1.body.refreshToken, u.refreshToken);

    // Reusar o token antigo derruba a família inteira.
    const reuse = await ctx.api().post('/auth/refresh').send({ refreshToken: u.refreshToken });
    assert.equal(reuse.status, 401);
    const r2 = await ctx.api().post('/auth/refresh').send({ refreshToken: r1.body.refreshToken });
    assert.equal(r2.status, 401);
  });

  it('logout revoga o refresh token', async () => {
    const u = await createUser(ctx);
    const out = await ctx.api().post('/auth/logout').send({ refreshToken: u.refreshToken });
    assert.equal(out.status, 204);
    const r = await ctx.api().post('/auth/refresh').send({ refreshToken: u.refreshToken });
    assert.equal(r.status, 401);
  });
});

describe('recuperação e troca de senha', () => {
  it('esqueci a senha: resposta igual para e-mail inexistente e redefinição com código', async () => {
    const u = await createUser(ctx);
    let r = await ctx.api().post('/auth/forgot-password').send({ email: 'naoexiste@teste.com' });
    assert.equal(r.status, 200);
    const generic = r.body.message;

    r = await ctx.api().post('/auth/forgot-password').send({ email: u.email });
    assert.equal(r.status, 200);
    assert.equal(r.body.message, generic);

    const code = lastCode(u.email, 'redefinir_senha');
    r = await ctx.api().post('/auth/reset-password').send({ email: u.email, codigo: code, novaSenha: 'novaSenha1' });
    assert.equal(r.status, 200);

    // Sessões antigas foram encerradas.
    r = await ctx.api().get('/user/me').set(u.auth);
    assert.equal(r.status, 401);

    r = await ctx.api().post('/auth/login').send({ email: u.email, senha: 'novaSenha1' });
    assert.equal(r.status, 200);

    // Código já usado não vale de novo.
    r = await ctx.api().post('/auth/reset-password').send({ email: u.email, codigo: code, novaSenha: 'outraSenha1' });
    assert.equal(r.status, 400);
  });

  it('troca de senha exige a senha atual correta', async () => {
    const u = await createUser(ctx);
    const id = u.user._id;
    let r = await ctx.api().put(`/user/${id}`).set(u.auth).send({ senha: 'nova12345' });
    assert.equal(r.status, 401);
    assert.equal(r.body.code, 'CURRENT_PASSWORD_REQUIRED');

    r = await ctx.api().put(`/user/${id}`).set(u.auth).send({ senha: 'nova12345', senhaAtual: 'errada' });
    assert.equal(r.status, 401);
    assert.equal(r.body.message, 'Senha atual incorreta.');

    r = await ctx.api().put(`/user/${id}`).set(u.auth).send({ senha: 'nova12345', senhaAtual: u.senha, nome: 'Novo Nome' });
    assert.equal(r.status, 200);
    assert.equal(r.body.nome, 'Novo Nome');
    assert.ok(r.body.accessToken && r.body.refreshToken, 'devolve sessão nova');
    const renew = await ctx.api().post('/auth/refresh').send({ refreshToken: r.body.refreshToken });
    assert.equal(renew.status, 200);
    const oldRefresh = await ctx.api().post('/auth/refresh').send({ refreshToken: u.refreshToken });
    assert.equal(oldRefresh.status, 401, 'refresh antigo encerrado');

    const old = await ctx.api().get('/user/me').set(u.auth);
    assert.equal(old.status, 401, 'token antigo deixa de valer');
    const fresh = await ctx.api().get('/user/me').set('Authorization', `Bearer ${r.body.accessToken}`);
    assert.equal(fresh.status, 200);
  });

  it('trocar o e-mail exige a senha atual', async () => {
    const u = await createUser(ctx);
    let r = await ctx.api().put(`/user/${u.user._id}`).set(u.auth).send({ email: 'novo-email@teste.com' });
    assert.equal(r.status, 401);
    r = await ctx.api().put(`/user/${u.user._id}`).set(u.auth).send({ email: 'novo-email@teste.com', senhaAtual: u.senha });
    assert.equal(r.status, 200);
    assert.equal(r.body.email, 'novo-email@teste.com');
  });
});
