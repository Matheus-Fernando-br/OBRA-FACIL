import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createUser, setupTestApp, teardown, VALID_CPF_2 } from './helpers.js';

let ctx;
let ana;
let beto;

before(async () => {
  ctx = await setupTestApp();
  ana = await createUser(ctx, { email: 'ana@dados.com' });
  beto = await createUser(ctx, { email: 'beto@dados.com' });
});
after(teardown);

const orcamentoBody = (cliente) => ({
  nome: 'Reforma da cozinha',
  cliente,
  endereco: { CEP: '30000-000', estado: 'MG', cidade: 'BH', bairro: 'Centro', rua: 'Rua A', numero: '10', complemento: '' },
  categoria: [
    {
      id: 1,
      nome: 'Demolição',
      preco_total_da_categoria: 500,
      servicos: [{ id: 1, nome: 'Remover piso', descricao: '', unidade: 'm²', quantidade_unidade: 10.5, preco_da_unidade: 47.62, preco_total: 500 }],
    },
  ],
  preco: 500,
  bdi: 20,
  preco_com_bdi: 600,
  valido_durante: 15,
  responsavel: '000000000000000000000000', // ignorado: o dono vem do token
});

describe('CRUD e isolamento entre usuários', () => {
  let clienteAna;
  let orcamentoAna;
  let obraAna;
  let produtoAna;

  it('Ana cria cliente, orçamento, obra e item do catálogo', async () => {
    let r = await ctx.api().post('/client').set(ana.auth).send({ nome: 'Cliente da Ana', tipo: 'FISICO', CPF: '529.982.247-25', telefone: '(31) 99999-0000', email: 'c@x.com' });
    assert.equal(r.status, 201);
    clienteAna = r.body;
    assert.equal(r.body.CPF, '52998224725');

    r = await ctx.api().post('/orcamento').set(ana.auth).send(orcamentoBody(clienteAna._id));
    assert.equal(r.status, 201, JSON.stringify(r.body));
    orcamentoAna = r.body;
    assert.equal(String(r.body.responsavel._id), ana.user._id, 'dono vem do token');
    assert.equal(r.body.responsavel.senha, undefined, 'populate não vaza a senha');
    assert.equal(r.body.categoria[0].servicos[0].quantidade_unidade, 10.5);

    r = await ctx.api().post('/obra').set(ana.auth).send({ orcamento: orcamentoAna._id, categoria: [{ nome: 'Demolição', servicos: [{ nome: 'Remover piso', qt_dias_prevista: 2 }] }], data_inicio_prevista: '2026-11-01', data_fim_prevista: '2026-11-10' });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    obraAna = r.body;
    assert.equal(r.body.orcamento.cliente.nome, 'Cliente da Ana');

    r = await ctx.api().post('/produto').set(ana.auth).send({ nome: 'Piso porcelanato', unidade: 'm²', preco_unidade: 89.9, tipo: 'PRODUTO' });
    assert.equal(r.status, 201);
    produtoAna = r.body;

    r = await ctx.api().get('/orcamento/client/' + clienteAna._id).set(ana.auth);
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 1);
    r = await ctx.api().get('/obra/client/' + clienteAna._id).set(ana.auth);
    assert.equal(r.body.length, 1);
  });

  it('Beto não vê, não altera e não exclui nada da Ana', async () => {
    const listas = await Promise.all([
      ctx.api().get('/client/userClients').set(beto.auth),
      ctx.api().get('/orcamento/userOrcamentos').set(beto.auth),
      ctx.api().get('/obra/userObras').set(beto.auth),
      ctx.api().get('/produto').set(beto.auth),
      ctx.api().get('/orcamento/client/' + clienteAna._id).set(beto.auth),
      ctx.api().get('/obra/client/' + clienteAna._id).set(beto.auth),
    ]);
    for (const r of listas) assert.deepEqual(r.body, []);

    const alvos = [
      ['client', clienteAna._id],
      ['orcamento', orcamentoAna._id],
      ['obra', obraAna._id],
      ['produto', produtoAna._id],
    ];
    for (const [rota, id] of alvos) {
      assert.equal((await ctx.api().get(`/${rota}/${id}`).set(beto.auth)).status, 404, `GET ${rota}`);
      assert.equal((await ctx.api().put(`/${rota}/${id}`).set(beto.auth).send({ nome: 'hack' })).status, 404, `PUT ${rota}`);
      assert.equal((await ctx.api().delete(`/${rota}/${id}`).set(beto.auth)).status, 404, `DELETE ${rota}`);
    }

    // Não pode usar o cliente/orçamento da Ana nos próprios registros.
    let r = await ctx.api().post('/orcamento').set(beto.auth).send(orcamentoBody(clienteAna._id));
    assert.equal(r.status, 400);
    r = await ctx.api().post('/obra').set(beto.auth).send({ orcamento: orcamentoAna._id });
    assert.equal(r.status, 400);

    // Não pode mexer na conta da Ana.
    assert.equal((await ctx.api().put(`/user/${ana.user._id}`).set(beto.auth).send({ nome: 'x' })).status, 404);
    assert.equal((await ctx.api().delete(`/user/${ana.user._id}`).set(beto.auth).send({ senha: beto.senha })).status, 404);

    // Ana continua intacta.
    r = await ctx.api().get(`/client/${clienteAna._id}`).set(ana.auth);
    assert.equal(r.body.nome, 'Cliente da Ana');
  });

  it('rotas antigas sem autenticação não existem mais', async () => {
    for (const rota of ['/user', '/client', '/orcamento', '/obra']) {
      const r = await ctx.api().get(rota);
      assert.ok([401, 404].includes(r.status), `${rota} → ${r.status}`);
    }
  });

  it('ids inválidos respondem 404 e campos internos são ignorados', async () => {
    assert.equal((await ctx.api().get('/client/abc').set(ana.auth)).status, 404);
    const r = await ctx.api().put(`/client/${clienteAna._id}`).set(ana.auth).send({ responsavel: beto.user._id, nome: 'Renomeado' });
    assert.equal(r.status, 200);
    assert.equal(String(r.body.responsavel), ana.user._id);
  });

  it('impede excluir cliente com orçamento e orçamento com obra', async () => {
    let r = await ctx.api().delete(`/client/${clienteAna._id}`).set(ana.auth);
    assert.equal(r.status, 409);
    r = await ctx.api().delete(`/orcamento/${orcamentoAna._id}`).set(ana.auth);
    assert.equal(r.status, 409);
  });

  it('arquivar e editar orçamento e obra', async () => {
    let r = await ctx.api().put(`/orcamento/${orcamentoAna._id}`).set(ana.auth).send({ arquivado: true });
    assert.equal(r.status, 200);
    assert.equal(r.body.arquivado, true);
    r = await ctx.api().put(`/obra/${obraAna._id}`).set(ana.auth).send({ status: 'ATRASADO', porcentagem_de_conclusao: 40 });
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ATRASADO');
  });
});

describe('limites do plano Gratuito', () => {
  it('bloqueia a 4ª obra ativa; arquivadas não contam; desarquivar respeita o limite', async () => {
    const u = await createUser(ctx);
    const cli = (await ctx.api().post('/client').set(u.auth).send({ nome: 'Cliente', CPF: VALID_CPF_2 })).body;
    const orc = (await ctx.api().post('/orcamento').set(u.auth).send(orcamentoBody(cli._id))).body;

    const obras = [];
    for (let i = 0; i < 3; i++) {
      const r = await ctx.api().post('/obra').set(u.auth).send({ orcamento: orc._id });
      assert.equal(r.status, 201);
      obras.push(r.body);
    }
    let r = await ctx.api().post('/obra').set(u.auth).send({ orcamento: orc._id });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'PLAN_LIMIT');
    assert.equal(r.body.limite, 3);
    assert.match(r.body.message, /limite de 3 obras/);

    await ctx.api().put(`/obra/${obras[0]._id}`).set(u.auth).send({ arquivado: true });
    r = await ctx.api().post('/obra').set(u.auth).send({ orcamento: orc._id });
    assert.equal(r.status, 201);

    r = await ctx.api().put(`/obra/${obras[0]._id}`).set(u.auth).send({ arquivado: false });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'PLAN_LIMIT');

    const sub = await ctx.api().get('/subscription/me').set(u.auth);
    assert.equal(sub.body.plano.id, 'gratuito');
    assert.equal(sub.body.uso.obras, 3);
  });
});

describe('exclusão de conta', () => {
  it('exige a senha e apaga todos os dados', async () => {
    const u = await createUser(ctx);
    const cli = (await ctx.api().post('/client').set(u.auth).send({ nome: 'Cliente X' })).body;
    await ctx.api().post('/orcamento').set(u.auth).send(orcamentoBody(cli._id));
    await ctx.api().post('/produto').set(u.auth).send({ nome: 'Item', unidade: 'un', preco_unidade: 1 });

    let r = await ctx.api().delete(`/user/${u.user._id}`).set(u.auth).send({ senha: 'errada' });
    assert.equal(r.status, 401);

    r = await ctx.api().delete(`/user/${u.user._id}`).set(u.auth).send({ senha: u.senha });
    assert.equal(r.status, 200);

    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    const uid = new mongoose.Types.ObjectId(u.user._id);
    assert.equal(await db.collection('usuarios').countDocuments({ _id: uid }), 0);
    assert.equal(await db.collection('clientes').countDocuments({ responsavel: uid }), 0);
    assert.equal(await db.collection('orcamentos').countDocuments({ responsavel: uid }), 0);
    assert.equal(await db.collection('produtos').countDocuments({ responsavel: uid }), 0);
    assert.equal(await db.collection('sessoes').countDocuments({ userId: uid }), 0);

    r = await ctx.api().get('/user/me').set(u.auth);
    assert.equal(r.status, 401);
    r = await ctx.api().post('/auth/login').send({ email: u.email, senha: u.senha });
    assert.equal(r.status, 401);
  });

  it('exporta os dados da conta (LGPD)', async () => {
    const r = await ctx.api().get('/user/me/export').set(ana.auth);
    assert.equal(r.status, 200);
    assert.equal(r.body.usuario.email, ana.email);
    assert.ok(Array.isArray(r.body.clientes));
    assert.equal(r.body.usuario.senha, undefined);
  });
});
