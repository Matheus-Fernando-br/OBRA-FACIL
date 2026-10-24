import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate, validId } from '../middlewares/validate.js';
import Produto from '../models/Produto.js';
import { assertWithinLimit } from '../services/plans.js';
import { notFound } from '../utils/errors.js';
import { produtoCreateSchema, produtoUpdateSchema } from '../validators/schemas.js';

/** Catálogo de produtos e serviços do usuário (preços padrão para orçamentos). */
const router = Router();
router.use(requireAuth);

const owned = (req) => ({ _id: req.params.id, responsavel: req.user._id });

router.get('/', async (req, res) => {
  res.json(await Produto.find({ responsavel: req.user._id }).sort({ nome: 1 }).lean());
});

router.post('/', validate(produtoCreateSchema), async (req, res) => {
  await assertWithinLimit(req.user, 'produtos');
  res.status(201).json(await Produto.create({ ...req.body, responsavel: req.user._id }));
});

router.get('/:id', validId(), async (req, res) => {
  const item = await Produto.findOne(owned(req)).lean();
  if (!item) throw notFound('Item não encontrado.');
  res.json(item);
});

router.put('/:id', validId(), validate(produtoUpdateSchema), async (req, res) => {
  const item = await Produto.findOneAndUpdate(owned(req), { $set: req.body }, { new: true, runValidators: true }).lean();
  if (!item) throw notFound('Item não encontrado.');
  res.json(item);
});

router.delete('/:id', validId(), async (req, res) => {
  const result = await Produto.deleteOne(owned(req));
  if (!result.deletedCount) throw notFound('Item não encontrado.');
  res.json({ message: 'Item removido.' });
});

export default router;
