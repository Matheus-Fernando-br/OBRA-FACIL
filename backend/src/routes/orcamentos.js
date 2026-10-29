import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate, validId } from '../middlewares/validate.js';
import Client from '../models/Client.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import { assertWithinLimit } from '../services/plans.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { orcamentoCreateSchema, orcamentoUpdateSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

// "responsavel" volta só com dados públicos (nunca hash de senha etc.).
const populate = [{ path: 'cliente' }, { path: 'responsavel', select: 'nome email CPF CNPJ' }];
const owned = (req) => ({ _id: req.params.id, responsavel: req.user._id });

async function assertOwnClient(req, clienteId) {
  if (!(await Client.exists({ _id: clienteId, responsavel: req.user._id }))) {
    throw badRequest('Cliente não encontrado. Selecione um cliente da sua lista.', 'INVALID_CLIENT');
  }
}

router.get('/userOrcamentos', async (req, res) => {
  res.json(await Orcamento.find({ responsavel: req.user._id }).sort({ createdAt: -1 }).populate(populate).lean());
});

router.get('/client/:id', validId(), async (req, res) => {
  res.json(
    await Orcamento.find({ responsavel: req.user._id, cliente: req.params.id }).sort({ createdAt: -1 }).populate(populate).lean(),
  );
});

router.post('/', validate(orcamentoCreateSchema), async (req, res) => {
  await assertWithinLimit(req.user, 'orcamentos');
  await assertOwnClient(req, req.body.cliente);
  const { arquivado: _ignore, ...data } = req.body;
  const orcamento = await Orcamento.create({ ...data, responsavel: req.user._id });
  res.status(201).json(await orcamento.populate(populate));
});

router.get('/:id', validId(), async (req, res) => {
  const orcamento = await Orcamento.findOne(owned(req)).populate(populate).lean();
  if (!orcamento) throw notFound('Orçamento não encontrado.');
  res.json(orcamento);
});

router.put('/:id', validId(), validate(orcamentoUpdateSchema), async (req, res) => {
  const orcamento = await Orcamento.findOne(owned(req));
  if (!orcamento) throw notFound('Orçamento não encontrado.');

  if (req.body.cliente && String(req.body.cliente) !== String(orcamento.cliente)) {
    await assertOwnClient(req, req.body.cliente);
  }
  // Desarquivar volta a contar no limite do plano.
  if (req.body.arquivado === false && orcamento.arquivado) await assertWithinLimit(req.user, 'orcamentos');

  orcamento.set(req.body);
  await orcamento.save();
  res.json(await orcamento.populate(populate));
});

/**
 * Aprovação direta (card do orçamento). Só passa de PENDENTE para APROVADO,
 * numa única operação no banco: duas aprovações seguidas não duplicam nada.
 */
router.post('/:id/aprovar', validId(), async (req, res) => {
  const aprovado = await Orcamento.findOneAndUpdate(
    { ...owned(req), status: 'PENDENTE', arquivado: { $ne: true } },
    { $set: { status: 'APROVADO', aprovadoEm: new Date() } },
    { new: true },
  ).populate(populate);
  if (aprovado) return res.json(aprovado);
  const atual = await Orcamento.findOne(owned(req)).lean();
  if (!atual) throw notFound('Orçamento não encontrado.');
  if (atual.status === 'APROVADO') throw conflict('Este orçamento já está aprovado.', 'ALREADY_APPROVED');
  throw conflict(atual.arquivado ? 'Desarquive o orçamento antes de aprovar.' : 'Só orçamentos pendentes podem ser aprovados.', 'NOT_APPROVABLE');
});

router.delete('/:id', validId(), async (req, res) => {
  const orcamento = await Orcamento.findOne(owned(req));
  if (!orcamento) throw notFound('Orçamento não encontrado.');
  const obras = await Obra.countDocuments({ responsavel: req.user._id, orcamento: orcamento._id });
  if (obras > 0) {
    throw conflict('Este orçamento virou obra. Exclua a obra antes de excluir o orçamento.', 'BUDGET_HAS_WORK');
  }
  await orcamento.deleteOne();
  res.json({ message: 'Orçamento removido com sucesso.' });
});

export default router;
