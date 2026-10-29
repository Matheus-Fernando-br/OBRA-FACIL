import Notificacao from '../models/Notificacao.js';
import Client from '../models/Client.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import Produto from '../models/Produto.js';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import { sendNoticeEmailSafe } from './mail.js';
import { detachUserSubscriptions } from './subscriptions.js';

/**
 * Exclui a conta e TODOS os dados do usuário (LGPD / Google Play).
 * Pagamentos ficam sem vínculo com a pessoa (obrigação fiscal).
 */
export async function deleteUserAccount(user) {
  const id = user._id;
  await detachUserSubscriptions(id);

  const legado = await User.findById(id).select('+clientes').lean();
  const [clientes, orcamentos, obras, produtos] = await Promise.all([
    Client.deleteMany({ $or: [{ responsavel: id }, { _id: { $in: legado?.clientes ?? [] } }] }),
    Orcamento.deleteMany({ responsavel: id }),
    Obra.deleteMany({ responsavel: id }),
    Produto.deleteMany({ responsavel: id }),
    RefreshToken.deleteMany({ userId: id }),
    VerificationCode.deleteMany({ userId: id }),
    Notificacao.deleteMany({ userId: id }),
  ]);
  await User.deleteOne({ _id: id });

  sendNoticeEmailSafe({ nome: user.nome, email: user.email }, 'Conta excluída — Obra Fácil', 'Sua conta foi excluída', [
    `Olá, ${user.nome}. Sua conta e todos os seus dados no Obra Fácil foram excluídos.`,
    'Obrigado por usar o app. Se mudar de ideia, é só criar uma conta nova.',
  ]);

  return {
    clientes: clientes.deletedCount,
    orcamentos: orcamentos.deletedCount,
    obras: obras.deletedCount,
    produtos: produtos.deletedCount,
  };
}
