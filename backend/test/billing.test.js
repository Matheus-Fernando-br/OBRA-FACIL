import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, beforeEach, describe, it } from 'node:test';
import { createUser, setupTestApp, teardown } from './helpers.js';

let ctx;
let mpMod;
let subsMod;
const store = { preapprovals: new Map(), authorized: new Map(), payments: new Map(), cancelados: [], paymentBodies: [] };

/** Mercado Pago simulado: guarda as assinaturas criadas em memória. */
const fakeMp = {
  async createPreapproval(body) {
    const id = `pre${crypto.randomBytes(6).toString('hex')}`;
    if (body.card_token_id === 'tok_recusado') {
      throw Object.assign(new Error('x'), { status: 502, providerStatus: 400, providerMessage: 'CC_VAL_433 Credit card validation has failed' });
    }
    const pre = {
      id,
      status: body.card_token_id ? 'authorized' : 'pending',
      init_point: `https://mp.teste/checkout/${id}`,
      ...body,
      ...(body.card_token_id ? { next_payment_date: new Date(Date.now() + 30 * 86400000).toISOString() } : {}),
    };
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
  async getPayment(id) {
    const p = store.payments.get(String(id));
    if (!p) throw Object.assign(new Error('not found'), { providerStatus: 404 });
    return p;
  },
  /** Pix fica pendente; cartão com nome "APRO" no token aprova, "OTHE" recusa. */
  async createPayment(body) {
    store.paymentBodies.push(body);
    const id = String(Math.floor(Math.random() * 1e12));
    const pix = body.payment_method_id === 'pix';
    const p = {
      id,
      status: pix ? 'pending' : body.token === 'tok_otho' ? 'rejected' : 'approved',
      status_detail: pix ? 'pending_waiting_transfer' : body.token === 'tok_otho' ? 'cc_rejected_other_reason' : 'accredited',
      transaction_amount: body.transaction_amount,
      currency_id: 'BRL',
      external_reference: body.external_reference,
      payment_method_id: body.payment_method_id,
      payment_type_id: pix ? 'bank_transfer' : body.payment_method_id.startsWith('deb') ? 'debit_card' : 'credit_card',
      date_of_expiration: body.date_of_expiration,
      ...(pix ? { point_of_interaction: { transaction_data: { qr_code: '00020126PIXCOPIAECOLA', qr_code_base64: 'iVBORw0KGgo=', ticket_url: 'https://mp.teste/pix' } } } : {}),
    };
    store.payments.set(id, p);
    return p;
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

describe('cartão próprio, sem conta no Mercado Pago', () => {
  it('cobrança automática com o token do cartão ativa o plano na hora', async () => {
    const u = await createUser(ctx);
    const r = await ctx.api().post('/subscription/checkout').set(u.auth).set('X-Platform', 'web').send({ planoId: 'profissional', cardTokenId: 'tok_cartao_ok_123', payerEmail: 'cliente@gmail.com' });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.initPoint, null);
    assert.equal(r.body.plano.id, 'profissional');
    const pre = [...store.preapprovals.values()].find((p) => p.card_token_id === 'tok_cartao_ok_123');
    assert.equal(pre.status, 'authorized');
    assert.equal(pre.payer_email, 'cliente@gmail.com');
    assert.equal(pre.auto_recurring.transaction_amount, 39.9);
    const me = await planoDe(u);
    assert.equal(me.modalidade, 'recorrente');
    assert.ok(me.renovaEm);
  });

  it('cartão recusado na cobrança automática vira mensagem clara e não muda o plano', async () => {
    const u = await createUser(ctx);
    const r = await ctx.api().post('/subscription/checkout').set(u.auth).set('X-Platform', 'web').send({ planoId: 'basico', cardTokenId: 'tok_recusado' });
    assert.equal(r.status, 400);
    assert.equal(r.body.code, 'CARD_REJECTED');
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('/plans informa a chave pública e as formas de pagamento', async () => {
    const r = await ctx.api().get('/plans').set('X-Platform', 'web');
    assert.equal(r.body.checkout.metodos.recorrente, true);
    assert.equal(r.body.checkout.metodos.avulso, true);
    assert.equal(r.body.checkout.diasAvulso, 30);
    assert.ok('publicKey' in r.body.checkout);
  });
});

describe('pagamento mês a mês (Pix, crédito, débito)', () => {
  const pagar = (u, formData, planoId = 'basico') =>
    ctx.api().post('/subscription/pay').set(u.auth).set('X-Platform', 'web').send({ planoId, formData });

  it('Pix: devolve o QR Code e só libera após o pagamento confirmado; webhook duplicado não soma de novo', async () => {
    const u = await createUser(ctx);
    // O valor enviado pelo navegador é ignorado: vale o preço do plano.
    const r = await pagar(u, { payment_method_id: 'pix', transaction_amount: 0.01, payer: { email: 'pagador@gmail.com' } });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.pagamento.status, 'pending');
    assert.equal(r.body.pagamento.metodo, 'pix');
    assert.ok(r.body.pagamento.pix.qrCode);
    assert.ok(r.body.pagamento.pix.qrCodeBase64);
    const body = store.paymentBodies.at(-1);
    assert.equal(body.transaction_amount, 19.9);
    assert.equal(body.payer.email, 'pagador@gmail.com');
    assert.match(body.date_of_expiration, /-03:00$/);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');

    // Pix pago: webhook "payment" consulta o Mercado Pago e libera 30 dias.
    const mpId = store.paymentBodies.length && [...store.payments.values()].find((p) => p.external_reference === body.external_reference).id;
    store.payments.get(mpId).status = 'approved';
    store.payments.get(mpId).status_detail = 'accredited';
    const requestId = crypto.randomUUID();
    let w = await webhook('payment', mpId, { requestId });
    assert.equal(w.status, 200);
    let me = await planoDe(u);
    assert.equal(me.plano.id, 'basico');
    assert.equal(me.modalidade, 'avulso');
    assert.equal(me.renovaEm, null);
    const dias = (new Date(me.acessoAte) - Date.now()) / 86400000;
    assert.ok(dias > 29.9 && dias <= 30, `30 dias (${dias})`);

    // Reenvio do mesmo pagamento (outro request-id) não soma de novo.
    w = await webhook('payment', mpId);
    assert.equal(w.status, 200);
    me = await planoDe(u);
    assert.ok((new Date(me.acessoAte) - Date.now()) / 86400000 <= 30);
    assert.ok(ctx.mails.some((m) => m.to === u.email && /Pagamento confirmado/.test(m.subject)));

    // Cancelar não se aplica (não há cobrança automática).
    const c = await ctx.api().post('/subscription/cancel').set(u.auth);
    assert.equal(c.status, 404);
  });

  it('cartão de crédito aprovado libera na hora e o segundo pagamento soma 30 dias', async () => {
    const u = await createUser(ctx);
    let r = await pagar(u, { payment_method_id: 'master', payment_type_id: 'credit_card', token: 'tok_apro', issuer_id: '24', installments: 12 });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.pagamento.status, 'approved');
    assert.equal(r.body.plano.id, 'basico');
    assert.equal(store.paymentBodies.at(-1).installments, 1, 'sempre à vista');

    r = await pagar(u, { payment_method_id: 'debelo', payment_type_id: 'debit_card', token: 'tok_apro2' });
    assert.equal(r.body.pagamento.metodo, 'debit_card');
    const me = await planoDe(u);
    const dias = (new Date(me.acessoAte) - Date.now()) / 86400000;
    assert.ok(dias > 59.9 && dias <= 60, `60 dias (${dias})`);
  });

  it('cartão recusado devolve o motivo e não libera', async () => {
    const u = await createUser(ctx);
    const r = await pagar(u, { payment_method_id: 'visa', payment_type_id: 'credit_card', token: 'tok_otho' });
    assert.equal(r.status, 201);
    assert.equal(r.body.pagamento.status, 'rejected');
    assert.match(r.body.pagamento.mensagem, /recusou|recusado/i);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('cartão sem token é recusado', async () => {
    const u = await createUser(ctx);
    const r = await pagar(u, { payment_method_id: 'visa' });
    assert.equal(r.status, 400);
    assert.equal(r.body.code, 'INVALID_CARD');
  });

  it('consulta do pagamento (polling) busca o estado no Mercado Pago', async () => {
    const u = await createUser(ctx);
    const r = await pagar(u, { payment_method_id: 'pix' });
    const id = r.body.pagamento._id;
    const mp = [...store.payments.values()].find((p) => p.external_reference === `pay_${id}`);
    let s = await ctx.api().get(`/subscription/payment/${id}`).set(u.auth);
    assert.equal(s.body.pagamento.status, 'pending');
    mp.status = 'approved';
    s = await ctx.api().get(`/subscription/payment/${id}`).set(u.auth);
    assert.equal(s.body.pagamento.status, 'approved');
    assert.equal(s.body.plano.id, 'basico');

    // Outro usuário não vê o pagamento.
    const outro = await createUser(ctx);
    s = await ctx.api().get(`/subscription/payment/${id}`).set(outro.auth);
    assert.equal(s.status, 404);
  });

  it('valor divergente no Mercado Pago não libera o plano', async () => {
    const u = await createUser(ctx);
    const r = await pagar(u, { payment_method_id: 'pix' }, 'profissional');
    const mp = [...store.payments.values()].find((p) => p.external_reference === `pay_${r.body.pagamento._id}`);
    Object.assign(mp, { status: 'approved', transaction_amount: 1 });
    await webhook('payment', mp.id);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('estorno retira os dias pagos', async () => {
    const u = await createUser(ctx);
    const r = await pagar(u, { payment_method_id: 'master', payment_type_id: 'credit_card', token: 'tok_apro' });
    assert.equal((await planoDe(u)).plano.id, 'basico');
    const mp = [...store.payments.values()].find((p) => p.external_reference === `pay_${r.body.pagamento._id}`);
    mp.status = 'refunded';
    await webhook('payment', mp.id);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('lembrete 3 dias antes e volta ao Gratuito no vencimento', async () => {
    const u = await createUser(ctx);
    await pagar(u, { payment_method_id: 'master', payment_type_id: 'credit_card', token: 'tok_apro' });
    const Subscription = (await import('../src/models/Subscription.js')).default;
    const me = await planoDe(u);
    await Subscription.updateOne({ _id: me.assinatura._id }, { $set: { acessoAte: new Date(Date.now() + 2 * 86400000) } });
    let resumo = await subsMod.reconcileSubscriptions();
    assert.ok(resumo.lembretes >= 1);
    assert.ok(ctx.mails.some((m) => m.to === u.email && /vence em/.test(m.subject)));
    await subsMod.reconcileSubscriptions();
    assert.equal(ctx.mails.filter((m) => m.to === u.email && /vence em/.test(m.subject)).length, 1, 'um lembrete só');

    await Subscription.updateOne({ _id: me.assinatura._id }, { $set: { acessoAte: new Date(Date.now() - 1000) } });
    resumo = await subsMod.reconcileSubscriptions();
    assert.ok(resumo.vencidas >= 1);
    assert.equal((await planoDe(u)).plano.id, 'gratuito');
  });

  it('forma de pagamento desligada no painel é recusada', async () => {
    const { setSetting } = await import('../src/services/settings.js');
    await setSetting('billing', { pagamentoAvulso: false }, 'teste');
    const u = await createUser(ctx);
    const r = await pagar(u, { payment_method_id: 'pix' });
    await setSetting('billing', { pagamentoAvulso: true }, 'teste');
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'PAYMENT_METHOD_DISABLED');
  });
});

describe('webhook com duas assinaturas secretas (teste e produção)', () => {
  it('aceita qualquer uma das chaves cadastradas', () => {
    const a = crypto.randomBytes(16).toString('hex');
    const b = crypto.randomBytes(16).toString('hex');
    const sig = mpMod.signWebhook({ dataId: '123', requestId: 'r1', secret: b });
    assert.equal(mpMod.verifyWebhookSignature({ signature: sig, requestId: 'r1', dataId: '123', secret: `${a}, ${b}` }), true);
    assert.equal(mpMod.verifyWebhookSignature({ signature: sig, requestId: 'r1', dataId: '123', secret: a }), false);
  });
});
