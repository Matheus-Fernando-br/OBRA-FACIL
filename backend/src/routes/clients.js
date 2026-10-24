import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate, validId } from '../middlewares/validate.js';
import Client from '../models/Client.js';
import Orcamento from '../models/Orcamento.js';
import { assertWithinLimit } from '../services/plans.js';
import { onlyDigits } from '../utils/documents.js';
import { conflict, notFound } from '../utils/errors.js';
import { clientCreateSchema, clientUpdateSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

const owned = (req) => ({ _id: req.params.id, responsavel: req.user._id });

function normalizeDocs(body, raw = {}) {
  const set = { ...body };
  const unset = {};
  for (const doc of ['CPF', 'CNPJ']) {
    if (set[doc]) set[doc] = onlyDigits(set[doc]);
    else if (doc in raw && !raw[doc]) {
      delete set[doc];
      unset[doc] = 1;
    }
  }
  return { set, unset };
}

router.get('/userClients', async (req, res) => {
  res.json(await Client.find({ responsavel: req.user._id }).sort({ nome: 1 }).lean());
});

router.post('/', validate(clientCreateSchema), async (req, res) => {
  await assertWithinLimit(req.user, 'clientes');
  const { set } = normalizeDocs(req.body);
  const client = await Client.create({ ...set, responsavel: req.user._id });
  res.status(201).json(client);
});

router.get('/:id', validId(), async (req, res) => {
  const client = await Client.findOne(owned(req)).lean();
  if (!client) throw notFound('Cliente não encontrado.');
  res.json(client);
});

router.put('/:id', validId(), validate(clientUpdateSchema), async (req, res) => {
  const { set, unset } = normalizeDocs(req.body, req.rawBody);
  const client = await Client.findOneAndUpdate(
    owned(req),
    { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { new: true, runValidators: true },
  ).lean();
  if (!client) throw notFound('Cliente não encontrado.');
  res.json(client);
});

/** Não exclui cliente com orçamentos (os orçamentos ficariam sem cliente). */
router.delete('/:id', validId(), async (req, res) => {
  const client = await Client.findOne(owned(req));
  if (!client) throw notFound('Cliente não encontrado.');
  const total = await Orcamento.countDocuments({ responsavel: req.user._id, cliente: client._id });
  if (total > 0) {
    throw conflict(
      `Este cliente tem ${total} orçamento(s). Exclua os orçamentos dele antes de remover o cliente.`,
      'CLIENT_HAS_BUDGETS',
    );
  }
  await client.deleteOne();
  res.json({ message: 'Cliente removido com sucesso.' });
});

export default router;
