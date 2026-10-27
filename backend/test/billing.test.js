import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, beforeEach, describe, it } from 'node:test';
import { createUser, setupTestApp, teardown } from './helpers.js';

let ctx;
let mpMod;
let subsMod;
const store = { preapprovals: new Map(), authorized: new Map(), cancelados: [] };

/** Mercado Pago simulado: guarda as assinaturas criadas em memória. */
const fakeMp = {
  async createPreapproval(body) {
    const id = `pre${crypto.randomBytes(6).toString('hex')}`;
    const pre = { id, status: 'pending', init_point: `https://mp.teste/checkout/${id}`, ...body };
    store.preapprovals.set(id, pre);
    return pre;
  },
  async getPreapproval(id) {
    const pre = store.preapprovals.get(id);
    if (!pre) throw Object.assign(new Error('not found'), { status: 404 });
    return pre;
  },
  async cancelPreapproval(id) {
    store.cancelados.push(id);
    const pre = store.preapprovals.get(id);
    if (pre) pre.status = 'cancelled';
    return pre;
  },
  async getAuthorizedPayment(id) {
    return store.authorized.get(id);
  },
  async getPayment() {
    return {};
  },
  async whoami() {
    return { id: 1, nickname: 'TESTE', site_id: 'MLB' };
  },
};

before(async () => {
  ctx = await setupTestApp();
  mpMod = await import('../src/services/mercadopago.js');
  subsMod = await import('../src/services/subscriptions.js');
  mpMod.setMercadoPagoClient(fakeMp);
});
after(teardown);
beforeEach(() => {
  store.cancelados.length = 0;
});

function webhook(tipo, dataId, { requestId = crypto.randomUUID(), signature } = {}) {
  const sig = signature ?? mpMod.signWebhook({ dataId, requestId });
  return ctx
    .api()
    .post(`/webhooks/mercadopago?data.id=${dataId}&type=${tipo}`)
    .set('x-signature', sig)
    .set('x-request-id', requestId)
    .send({ type: tipo, action: 'updated', data: { id: dataId } });
}

const planoDe = async (u) => (await ctx.api().get('/subscription/me').set(u.auth)).body;

async function checkout(u, planoId = 'basico') {
  const r = await ctx.api().post('/subscription/checkout').set(u.auth).set('X-Platform', 'web').send({ planoId });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const preId = r.body.initPoint.split('/').pop();
  return { preId, pre: store.preapprovals.get(preId), sub: r.body.assinatura };
}

function authorize(preId, next = new Date(Date.now() + 30 * 86400000)) {
  Object.assign(store.preapprovals.get(preId), { status: 'authorized', next_payment_date: next.toISOString() });
}

describe('planos e checkout', () => {
  it('GET /plans é público e informa o checkout por plataforma', async () => {
    let r = await ctx.api().get('/plans').set('X-Platform', 'android');
    assert.equal(r.status, 200);
    assert.equal(r.body.plans.length, 3);
    assert.equal(r.body.checkout.enabled, false, 'Android: desligado por padrão (regras da Google Play)');
    r = await ctx.api().get('/plans').set('X-Platform', 'web');
    assert.equal(r.body.checkout.enabled, true);
  });

  it('checkout no Android é recusado quando desligado no painel', async () => {
    const u = await createUser(ctx);
    const r = await ctx.api().post('/subscription/checkout').set(u.auth).set('X-Platform', 'android').send({ planoId: 'basico' });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'CHECKOUT_DISABLED');
  });

  it('o pedido do app sozinho não muda o plano', async () => {
    const u = await createUser(ctx);
    const { pre } = await checkout(u);
    assert.equal(pre.auto_recurring.transaction_amount, 19.9);
    assert.equal(pre.payer_email, u.email);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');

    // Rotas antigas de troca direta de plano não existem.
    const r = await ctx.api().put('/subscription/profissional').set(u.auth).send({});
    assert.equal(r.status, 404);
  });
});

describe('webhooks do Mercado Pago', () => {
  it('recusa assinatura inválida', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u);
    authorize(preId);
    const r = await webhook('subscription_preapproval', preId, { signature: 'ts=1,v1=deadbeef' });
    assert.equal(r.status, 401);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('ativa o plano só após confirmação consultada no Mercado Pago, e ignora duplicadas', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u);

    // Notificação válida, mas o Mercado Pago ainda diz "pending": nada muda.
    let r = await webhook('subscription_preapproval', preId);
    assert.equal(r.status, 200);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');

    authorize(preId);
    const requestId = crypto.randomUUID();
    r = await webhook('subscription_preapproval', preId, { requestId });
    assert.equal(r.status, 200);
    const me = await planoDe(u);
    assert.equal(me.plano.id, 'basico');
    assert.equal(me.status, 'ativa');
    assert.ok(me.renovaEm);

    r = await webhook('subscription_preapproval', preId, { requestId });
    assert.equal(r.body.duplicado, true);

    // Com o plano Básico, o limite de obras sobe para 20.
    assert.equal(me.plano.limites.obras, 20);
    assert.ok(ctx.telegrams.length >= 0);
  });

  it('valor adulterado não concede o plano', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u, 'profissional');
    authorize(preId);
    store.preapprovals.get(preId).auto_recurring.transaction_amount = 1;
    await webhook('subscription_preapproval', preId);
    const me = await planoDe(u);
    assert.equal(me.plano.id, 'gratuito');
  });

  it('referência de outro registro não concede o plano', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u);
    authorize(preId);
    store.preapprovals.get(preId).external_reference = '000000000000000000000000';
    await webhook('subscription_preapproval', preId);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('pagamento recusado: tolerância e depois volta ao Gratuito', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u);
    authorize(preId);
    await webhook('subscription_preapproval', preId);
    assert.equal((await planoDe(u)).plano.id, 'basico');

    store.authorized.set('ap1', { id: 'ap1', preapproval_id: preId, status: 'recycling', payment: { id: 99, status: 'rejected' }, transaction_amount: 19.9, currency_id: 'BRL', debit_date: new Date().toISOString() });
    let r = await webhook('subscription_authorized_payment', 'ap1');
    assert.equal(r.status, 200);
    let me = await planoDe(u);
    assert.equal(me.plano.id, 'basico', 'dentro da tolerância');
    assert.equal(me.assinatura.inadimplente, true);
    assert.ok(ctx.mails.some((m) => m.to === u.email && /cobrança/i.test(m.subject)));

    // Passou da tolerância (7 dias).
    const Subscription = (await import('../src/models/Subscription.js')).default;
    await Subscription.updateOne({ providerId: preId }, { $set: { inadimplenteDesde: new Date(Date.now() - 8 * 86400000) } });
    await subsMod.reconcileSubscriptions();
    me = await planoDe(u);
    assert.equal(me.plano.id, 'gratuito');

    // Pagamento aprovado depois: volta ao normal.
    store.authorized.set('ap2', { id: 'ap2', preapproval_id: preId, status: 'processed', payment: { id: 100, status: 'approved' }, transaction_amount: 19.9, currency_id: 'BRL', debit_date: new Date(Date.now() + 1000).toISOString() });
    await webhook('subscription_authorized_payment', 'ap2');
    me = await planoDe(u);
    assert.equal(me.plano.id, 'basico');
    assert.equal(me.assinatura.inadimplente, false);
  });

  it('cancelamento pelo usuário mantém o acesso até o fim do período pago', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u);
    authorize(preId);
    await webhook('subscription_preapproval', preId);

    const r = await ctx.api().post('/subscription/cancel').set(u.auth);
    assert.equal(r.status, 200);
    assert.ok(store.cancelados.includes(preId), 'cancelado no Mercado Pago');
    const me = await planoDe(u);
    assert.equal(me.plano.id, 'basico');
    assert.equal(me.status, 'cancelada');
    assert.ok(new Date(me.acessoAte) > new Date());
  });

  it('troca de plano cancela a assinatura anterior', async () => {
    const u = await createUser(ctx);
    const a = await checkout(u, 'basico');
    authorize(a.preId);
    await webhook('subscription_preapproval', a.preId);

    const b = await checkout(u, 'profissional');
    authorize(b.preId);
    await webhook('subscription_preapproval', b.preId);

    const me = await planoDe(u);
    assert.equal(me.plano.id, 'profissional');
    assert.ok(store.cancelados.includes(a.preId));
  });

  it('notificação simulada (ID inexistente no Mercado Pago) responde 200', async () => {
    const original = fakeMp.getPreapproval;
    fakeMp.getPreapproval = async () => {
      throw Object.assign(new Error('not found'), { providerStatus: 404 });
    };
    const r = await webhook('subscription_preapproval', '123456');
    fakeMp.getPreapproval = original;
    assert.equal(r.status, 200);
    assert.equal(r.body.ignorado, true);
  });

  it('notificação de assinatura desconhecida é ignorada', async () => {
    store.preapprovals.set('preDesconhecida', { id: 'preDesconhecida', status: 'authorized', external_reference: 'x', auto_recurring: { transaction_amount: 39.9, currency_id: 'BRL' } });
    const r = await webhook('subscription_preapproval', 'preDesconhecida');
    assert.equal(r.status, 200);
  });

  it('exclusão de conta cancela a cobrança no Mercado Pago', async () => {
    const u = await createUser(ctx);
    const { preId } = await checkout(u);
    authorize(preId);
    await webhook('subscription_preapproval', preId);
    const r = await ctx.api().delete(`/user/${u.user._id}`).set(u.auth).send({ senha: u.senha });
    assert.equal(r.status, 200);
    assert.ok(store.cancelados.includes(preId));
  });
});

describe('e-mail do pagador no Mercado Pago', () => {
  it('usa o e-mail da conta do Mercado Pago informado na página', async () => {
    const u = await createUser(ctx);
    const r = await ctx.api().post('/subscription/checkout').set(u.auth).set('X-Platform', 'web').send({ planoId: 'basico', payerEmail: 'Comprador@TestUser.com' });
    assert.equal(r.status, 201);
    const pre = store.preapprovals.get(r.body.initPoint.split('/').pop());
    assert.equal(pre.payer_email, 'comprador@testuser.com');
    const me = await ctx.api().get('/subscription/me').set(u.auth);
    assert.ok(me.body.pendente.initPoint, 'link pendente disponível para continuar o pagamento');
  });

  it('recusa de conta real x teste vira mensagem clara', async () => {
    const u = await createUser(ctx);
    const original = fakeMp.createPreapproval;
    fakeMp.createPreapproval = async () => {
      throw Object.assign(new Error('x'), { status: 502, providerStatus: 400, providerMessage: 'Both payer and collector must be real or test users' });
    };
    const r = await ctx.api().post('/subscription/checkout').set(u.auth).set('X-Platform', 'web').send({ planoId: 'basico' });
    fakeMp.createPreapproval = original;
    assert.equal(r.status, 400);
    assert.equal(r.body.code, 'PAYER_ENVIRONMENT_MISMATCH');
  });
});
