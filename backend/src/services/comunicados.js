import logger from '../config/logger.js';
import Comunicado from '../models/Comunicado.js';
import Notificacao from '../models/Notificacao.js';
import User from '../models/User.js';
import { sendNoticeEmail } from './mail.js';

/*
 * Comunicados do painel admin para os usuários do app: no painel de
 * notificações do app e/ou por e-mail (Brevo). Usuários bloqueados nunca
 * recebem; e-mail só para quem confirmou o endereço.
 */

/** Filtro de usuários a partir do público escolhido no painel. */
export function filtroPublico({ tipo, filtros = {}, userIds = [] }) {
  const f = { status: { $ne: 'bloqueado' } };
  if (tipo === 'selecionados') f._id = { $in: userIds };
  if (tipo === 'filtro') {
    if (filtros.plano) f.planoAtual = filtros.plano === 'gratuito' ? { $in: ['gratuito', null] } : filtros.plano;
    if (filtros.verificado) f.email_verificado = filtros.verificado === 'sim' ? true : { $ne: true };
    if (filtros.status === 'ativo') f.status = { $ne: 'bloqueado' };
  }
  return f;
}

export async function contarPublico(publico) {
  const filtro = filtroPublico(publico);
  const [total, comEmail] = await Promise.all([
    User.countDocuments(filtro),
    User.countDocuments({ ...filtro, email_verificado: true }),
  ]);
  return { total, comEmail };
}

const paragrafos = (texto) => texto.split(/\n{2,}|\r?\n/).map((p) => p.trim()).filter(Boolean);

/** Cria o comunicado, grava as notificações e dispara os e-mails em segundo plano. */
export async function enviarComunicado({ titulo, mensagem, canais, publico, enviadoPor }) {
  const filtro = filtroPublico(publico);
  const users = await User.find(filtro).select('_id nome email email_verificado').lean();

  const comunicado = await Comunicado.create({
    titulo,
    mensagem,
    canais,
    publico: {
      tipo: publico.tipo,
      filtros: publico.tipo === 'filtro' ? publico.filtros : undefined,
      quantidadeSelecionados: publico.tipo === 'selecionados' ? publico.userIds.length : undefined,
    },
    destinatarios: users.length,
    enviadoPor,
    emails: { enviados: 0, falhas: 0, emAndamento: Boolean(canais.email) },
  });

  if (canais.app && users.length) {
    await Notificacao.insertMany(
      users.map((u) => ({ userId: u._id, comunicadoId: comunicado._id, titulo, mensagem })),
      { ordered: false },
    );
  }

  if (canais.email) {
    const alvo = users.filter((u) => u.email_verificado && u.email);
    enviarEmails(comunicado._id, alvo, titulo, mensagem).catch((err) =>
      logger.error({ err: err.message }, 'Falha no envio de e-mails do comunicado'),
    );
  }
  return comunicado;
}

async function enviarEmails(comunicadoId, users, titulo, mensagem) {
  let enviados = 0;
  let falhas = 0;
  const fila = [...users];
  // Até 5 envios em paralelo (respeita os limites do Brevo).
  await Promise.all(
    Array.from({ length: Math.min(5, fila.length) }, async () => {
      while (fila.length) {
        const u = fila.shift();
        try {
          await sendNoticeEmail(u, `${titulo} — Obra Fácil`, titulo, [`Olá, ${u.nome}!`, ...paragrafos(mensagem)]);
          enviados++;
        } catch {
          falhas++;
        }
      }
    }),
  );
  await Comunicado.updateOne({ _id: comunicadoId }, { $set: { 'emails.enviados': enviados, 'emails.falhas': falhas, 'emails.emAndamento': false } });
}
