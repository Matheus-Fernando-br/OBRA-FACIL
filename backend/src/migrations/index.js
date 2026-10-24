import mongoose from 'mongoose';
import logger from '../config/logger.js';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';
import Client from '../models/Client.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import Payment from '../models/Payment.js';
import Produto from '../models/Produto.js';
import RefreshToken from '../models/RefreshToken.js';
import Setting from '../models/Setting.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import WebhookEvent from '../models/WebhookEvent.js';

/*
 * Migrações idempotentes, executadas no boot (antes de aceitar
 * requisições) e registradas na coleção "migracoes". Preservam os dados do
 * backend anterior (coleções usuarios, clientes, orcamentos, obras).
 */

const migrations = [
  {
    id: '001-normalizar-emails',
    async up(db) {
      const users = db.collection('usuarios');
      const cursor = users.find({}, { projection: { email: 1 } });
      let alterados = 0;
      for await (const u of cursor) {
        const normal = String(u.email ?? '').trim().toLowerCase();
        if (normal && normal !== u.email) {
          await users.updateOne({ _id: u._id }, { $set: { email: normal } });
          alterados++;
        }
      }
      const dup = await users
        .aggregate([{ $group: { _id: '$email', n: { $sum: 1 }, ids: { $push: '$_id' } } }, { $match: { n: { $gt: 1 } } }])
        .toArray();
      if (dup.length) logger.warn({ emailsDuplicados: dup.length }, 'Há e-mails duplicados na base — resolva pelo painel antes do índice único');
      return { alterados, duplicados: dup.length };
    },
  },
  {
    id: '002-dono-dos-clientes',
    /** No backend anterior o vínculo ficava só em usuarios.clientes[]. */
    async up(db) {
      const users = db.collection('usuarios');
      const clients = db.collection('clientes');
      let vinculados = 0;
      for await (const u of users.find({ clientes: { $exists: true, $ne: [] } }, { projection: { clientes: 1 } })) {
        const r = await clients.updateMany({ _id: { $in: u.clientes }, responsavel: { $exists: false } }, { $set: { responsavel: u._id } });
        vinculados += r.modifiedCount;
      }
      // Clientes usados em orçamentos herdam o dono do orçamento.
      for await (const o of db.collection('orcamentos').find({}, { projection: { cliente: 1, responsavel: 1 } })) {
        if (!o.cliente || !o.responsavel) continue;
        const r = await clients.updateOne({ _id: o.cliente, responsavel: { $exists: false } }, { $set: { responsavel: o.responsavel } });
        vinculados += r.modifiedCount;
      }
      const orfaos = await clients.countDocuments({ responsavel: { $exists: false } });
      if (orfaos) logger.warn({ orfaos }, 'Clientes sem dono identificado (ficam invisíveis no app)');
      return { vinculados, orfaos };
    },
  },
  {
    id: '003-contas-legadas',
    /**
     * O backend anterior não exigia e-mail verificado para entrar. Para não
     * bloquear quem já usava o app, as contas existentes são marcadas como
     * verificadas (verificacaoLegada) e recebem os campos novos.
     */
    async up(db) {
      const users = db.collection('usuarios');
      const verif = await users.updateMany(
        { email_verificado: { $ne: true } },
        { $set: { email_verificado: true, verificacaoLegada: true } },
      );
      await users.updateMany({ tokenVersion: { $exists: false } }, { $set: { tokenVersion: 0 } });
      await users.updateMany({ status: { $exists: false } }, { $set: { status: 'ativo' } });
      await users.updateMany({ planoAtual: { $exists: false } }, { $set: { planoAtual: 'gratuito' } });
      return { marcadasVerificadas: verif.modifiedCount };
    },
  },
  {
    id: '004-sessoes-antigas',
    /** Tokens do backend anterior (coleção "refreshes") não são mais válidos. */
    async up(db) {
      const nomes = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);
      let removida = false;
      for (const nome of ['refreshes', 'refresh']) {
        if (nomes.includes(nome)) {
          await db.collection(nome).drop();
          removida = true;
        }
      }
      return { removida };
    },
  },
];

/** Índices de todos os modelos (sempre conferidos no boot). */
async function syncIndexes() {
  const models = [User, Client, Orcamento, Obra, Produto, RefreshToken, VerificationCode, Subscription, Payment, WebhookEvent, Admin, AuditLog, Setting];
  for (const Model of models) {
    try {
      await Model.createIndexes();
    } catch (err) {
      logger.error({ err: err.message, model: Model.modelName }, 'Falha ao criar índice');
    }
  }
}

export async function runMigrations() {
  const db = mongoose.connection.db;
  const registry = db.collection('migracoes');
  const done = new Set((await registry.find({}, { projection: { _id: 1 } }).toArray()).map((m) => m._id));

  for (const m of migrations) {
    if (done.has(m.id)) continue;
    const started = Date.now();
    const result = await m.up(db);
    await registry.insertOne({ _id: m.id, executadaEm: new Date(), duracaoMs: Date.now() - started, resultado: result });
    logger.info({ migracao: m.id, result }, 'Migração aplicada');
  }

  await syncIndexes();
}
