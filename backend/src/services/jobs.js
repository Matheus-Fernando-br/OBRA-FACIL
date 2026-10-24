import logger from '../config/logger.js';
import { reconcileSubscriptions } from './subscriptions.js';

/*
 * Rotinas periódicas dentro do próprio serviço (uma instância no Render).
 * A reconciliação corrige webhooks perdidos e aplica o fim de períodos.
 */
const INTERVAL_MS = 6 * 3600 * 1000;
const state = { reconcile: { ultimaExecucao: null, resultado: null, erro: null, emExecucao: false } };
let timer;

export async function runReconcileNow() {
  if (state.reconcile.emExecucao) return { emExecucao: true };
  state.reconcile.emExecucao = true;
  try {
    const resultado = await reconcileSubscriptions();
    Object.assign(state.reconcile, { ultimaExecucao: new Date(), resultado, erro: null });
    logger.info({ resultado }, 'Reconciliação de assinaturas concluída');
    return resultado;
  } catch (err) {
    Object.assign(state.reconcile, { ultimaExecucao: new Date(), erro: err.message });
    logger.error({ err }, 'Falha na reconciliação de assinaturas');
    throw err;
  } finally {
    state.reconcile.emExecucao = false;
  }
}

export function startJobs() {
  // Primeira execução alguns minutos após o boot; depois a cada 6 horas.
  setTimeout(() => runReconcileNow().catch(() => {}), 3 * 60 * 1000).unref();
  timer = setInterval(() => runReconcileNow().catch(() => {}), INTERVAL_MS);
  timer.unref();
}

export function stopJobs() {
  clearInterval(timer);
}

export function jobsStatus() {
  return { reconciliacao: { ...state.reconcile, intervaloHoras: INTERVAL_MS / 3600000 } };
}
