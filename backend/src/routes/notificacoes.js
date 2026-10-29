import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { validate, validId } from '../middlewares/validate.js';
import Notificacao from '../models/Notificacao.js';
import { notFound } from '../utils/errors.js';

/** Notificações enviadas pela equipe (painel admin) para o usuário logado. */
const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await Notificacao.find({ userId: req.user._id, removidaEm: null })
    .select('titulo mensagem lidaEm createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(items);
});

router.post(
  '/lidas',
  validate(z.object({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(100).optional(), todas: z.boolean().optional() })),
  async (req, res) => {
    const filtro = { userId: req.user._id, lidaEm: null };
    if (!req.body.todas) filtro._id = { $in: req.body.ids ?? [] };
    const r = await Notificacao.updateMany(filtro, { $set: { lidaEm: new Date() } });
    res.json({ atualizadas: r.modifiedCount });
  },
);

router.delete('/:id', validId(), async (req, res) => {
  const r = await Notificacao.updateOne({ _id: req.params.id, userId: req.user._id }, { $set: { removidaEm: new Date() } });
  if (!r.matchedCount) throw notFound('Notificação não encontrada.');
  res.json({ ok: true });
});

export default router;
