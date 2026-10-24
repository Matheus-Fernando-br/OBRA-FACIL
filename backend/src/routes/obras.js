import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate, validId } from '../middlewares/validate.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import { assertWithinLimit } from '../services/plans.js';
import { badRequest, notFound } from '../utils/errors.js';
import { obraCreateSchema, obraUpdateSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

const populate = [
  { path: 'orcamento', populate: [{ path: 'cliente' }, { path: 'responsavel', select: 'nome email CPF CNPJ' }] },
  { path: 'responsavel', select: 'nome email CPF CNPJ' },
];
const owned = (req) => ({ _id: req.params.id, responsavel: req.user._id });

router.get('/userObras', async (req, res) => {
  res.json(await Obra.find({ responsavel: req.user._id }).sort({ createdAt: -1 }).populate(populate).lean());
});

router.get('/client/:id', validId(), async (req, res) => {
  const orcamentos = await Orcamento.find({ responsavel: req.user._id, cliente: req.params.id }).distinct('_id');
  res.json(
    await Obra.find({ responsavel: req.user._id, orcamento: { $in: orcamentos } })
      .sort({ createdAt: -1 })
      .populate(populate)
      .lean(),
  );
});

router.post('/', validate(obraCreateSchema), async (req, res) => {
  await assertWithinLimit(req.user, 'obras');
  if (!(await Orcamento.exists({ _id: req.body.orcamento, responsavel: req.user._id }))) {
    throw badRequest('Orçamento não encontrado.', 'INVALID_BUDGET');
  }
  const { arquivado: _ignore, ...data } = req.body;
  const obra = await Obra.create({ ...data, responsavel: req.user._id });
  res.status(201).json(await obra.populate(populate));
});

router.get('/:id', validId(), async (req, res) => {
  const obra = await Obra.findOne(owned(req)).populate(populate).lean();
  if (!obra) throw notFound('Obra não encontrada.');
  res.json(obra);
});

router.put('/:id', validId(), validate(obraUpdateSchema), async (req, res) => {
  const obra = await Obra.findOne(owned(req));
  if (!obra) throw notFound('Obra não encontrada.');

  if (req.body.orcamento && String(req.body.orcamento) !== String(obra.orcamento)) {
    if (!(await Orcamento.exists({ _id: req.body.orcamento, responsavel: req.user._id }))) {
      throw badRequest('Orçamento não encontrado.', 'INVALID_BUDGET');
    }
  }
  if (req.body.arquivado === false && obra.arquivado) await assertWithinLimit(req.user, 'obras');

  obra.set(req.body);
  await obra.save();
  res.json(await obra.populate(populate));
});

router.delete('/:id', validId(), async (req, res) => {
  const result = await Obra.deleteOne(owned(req));
  if (!result.deletedCount) throw notFound('Obra não encontrada.');
  res.json({ message: 'Obra removida com sucesso.' });
});

export default router;
