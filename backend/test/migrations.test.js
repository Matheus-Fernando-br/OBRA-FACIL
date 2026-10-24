import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { setupTestApp, teardown } from './helpers.js';

/* Dados no formato do backend anterior continuam funcionando. */
let ctx;
let db;
const ids = {};

before(async () => {
  ctx = await setupTestApp();
  db = mongoose.connection.db;
  const bcrypt = (await import('bcryptjs')).default;
  ids.cliente = new mongoose.Types.ObjectId();
  ids.user = new mongoose.Types.ObjectId();
  await db.collection('clientes').insertOne({ _id: ids.cliente, nome: 'Cliente Legado', tipo: 'FISICO' });
  await db.collection('usuarios').insertOne({
    _id: ids.user,
    nome: 'Usuário Legado',
    email: '  Legado@Email.COM ',
    senha: await bcrypt.hash('senhaAntiga', 4),
    clientes: [ids.cliente],
    email_verificado: false,
    tipo: false,
  });
  await db.collection('orcamentos').insertOne({ nome: 'Orçamento legado', cliente: ids.cliente, responsavel: ids.user, categoria: [], arquivado: false });
  // Remove o registro para forçar a reexecução das migrações sobre os dados legados.
  await db.collection('migracoes').deleteMany({});
  const { runMigrations } = await import('../src/migrations/index.js');
  await runMigrations();
});
after(teardown);

describe('migrações', () => {
  it('usuário legado entra com a senha antiga e vê seus dados', async () => {
    const login = await ctx.api().post('/auth/login').send({ email: 'legado@email.com', senha: 'senhaAntiga' });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    const auth = { Authorization: `Bearer ${login.body.accessToken}` };

    const clientes = await ctx.api().get('/client/userClients').set(auth);
    assert.equal(clientes.body.length, 1);
    assert.equal(clientes.body[0].nome, 'Cliente Legado');

    const orcamentos = await ctx.api().get('/orcamento/userOrcamentos').set(auth);
    assert.equal(orcamentos.body.length, 1);
    assert.equal(orcamentos.body[0].cliente.nome, 'Cliente Legado');
  });

  it('migrações são idempotentes', async () => {
    const { runMigrations } = await import('../src/migrations/index.js');
    await runMigrations();
    const n = await db.collection('migracoes').countDocuments();
    assert.ok(n >= 4);
  });
});
