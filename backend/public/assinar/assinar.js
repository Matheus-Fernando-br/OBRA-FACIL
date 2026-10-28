/*
 * Página web de assinatura. Usa a mesma API do app.
 * O pagamento usa o formulário seguro do Mercado Pago (Bricks): o cliente
 * paga com o próprio cartão ou Pix, sem precisar de conta no Mercado Pago.
 *   - recorrente: Card Payment Brick → token do cartão → POST /subscription/checkout
 *   - avulso:     Payment Brick (Pix, crédito, débito) → POST /subscription/pay
 */

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const brl = (n) => Number(n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '');
const time = (d) => (d ? new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
const LIMITS = {
  clientes: ['clientes', 'Clientes ilimitados'],
  orcamentos: ['orçamentos ativos', 'Orçamentos ilimitados'],
  obras: ['obras ativas', 'Obras ilimitadas'],
  produtos: ['itens no catálogo', 'Catálogo ilimitado'],
};
const SDK_URL = 'https://sdk.mercadopago.com/js/v2';
const TELAS = ['login', 'planos', 'pagamento', 'resultado', 'carregando'];

// Token só nesta aba (sessionStorage); some ao fechar o navegador.
const KEY = 'of_assinar_token';
const store = {
  get: (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      if (v) sessionStorage.setItem(k, v);
      else sessionStorage.removeItem(k);
    } catch {
      /* navegador sem storage */
    }
  },
};

const state = { usuario: null, me: null, plans: [], checkout: null, plano: null, modo: null, brick: null, pixTimer: null };

// Plano vindo do app: /assinar?plano=basico
const planoDaUrl = new URLSearchParams(location.search).get('plano');

// ------------------------------------------------------------------ feedback

function alerta(tipo, texto) {
  const el = $('#alerta');
  if (!texto) {
    el.hidden = true;
    return;
  }
  el.className = `alert ${tipo}`;
  el.textContent = texto;
  el.hidden = false;
  if (tipo === 'erro') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function botao(btn, carregando, texto) {
  btn.disabled = carregando;
  btn.classList.toggle('loading', carregando);
  btn.setAttribute('aria-busy', String(carregando));
  if (texto) btn.querySelector('.label').textContent = texto;
}

function etapa(n) {
  document.querySelectorAll('#steps li').forEach((li) => {
    const s = Number(li.dataset.step);
    li.classList.toggle('active', s === n);
    li.classList.toggle('done', s < n);
  });
}

let dicaTimer;
function show(tela, msg) {
  for (const t of TELAS) $(`#tela-${t}`).hidden = t !== tela;
  $('#sair').hidden = ['login', 'carregando'].includes(tela);
  clearTimeout(dicaTimer);
  if (tela !== 'resultado') pararPix();
  if (tela !== 'pagamento') desmontarBrick();
  if (tela === 'carregando') {
    $('#carregando-txt').textContent = msg ?? 'Carregando…';
    $('#carregando-dica').hidden = true;
    // Servidor "acordando": avisa que pode demorar.
    dicaTimer = setTimeout(() => ($('#carregando-dica').hidden = false), 5000);
  }
  etapa({ login: 1, planos: 2, pagamento: 3, resultado: 3 }[tela] ?? 1);
  if (tela !== 'carregando') window.scrollTo({ top: 0, behavior: 'smooth' });
}

function overlay(texto) {
  $('#overlay').hidden = !texto;
  if (texto) $('#overlay-txt').textContent = texto;
}

// ------------------------------------------------------------------ API

async function api(path, { method = 'GET', body } = {}) {
  const token = store.get(KEY);
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        'X-Platform': 'web',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.'), { rede: true });
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') {
    store.set(KEY, null);
    show('login');
    throw Object.assign(new Error('Sua sessão expirou. Entre novamente.'), { status: 401 });
  }
  if (!res.ok) {
    const msg = data.message || (res.status >= 500 ? 'O servidor teve um problema. Tente novamente em instantes.' : 'Não foi possível concluir.');
    throw Object.assign(new Error(msg), { status: res.status, code: data.code });
  }
  return data;
}

// ------------------------------------------------------------------ planos

function limitsList(plan) {
  return Object.entries(LIMITS)
    .map(([k, [label, ilimitado]]) => `<li>${plan.limites[k] == null ? ilimitado : `Até ${plan.limites[k]} ${label}`}</li>`)
    .join('');
}

function statusAtual(me) {
  if (me.origem === 'cortesia') return `<span class="badge">cortesia</span>`;
  if (me.status === 'ativa' && me.assinatura?.inadimplente) return `<span class="badge bad">pagamento pendente</span>`;
  if (me.status === 'ativa' && me.modalidade === 'avulso') return `<span class="badge ok">pago</span>`;
  if (me.status === 'ativa') return `<span class="badge ok">ativo</span>`;
  if (me.status === 'cancelada') return `<span class="badge aviso">cancelado</span>`;
  return '';
}

function linhaStatus(me) {
  if (me.modalidade === 'avulso' && me.acessoAte) return `Pago até ${date(me.acessoAte)} (mês a mês, sem cobrança automática).`;
  if (me.renovaEm) return `Cobrança automática. Próxima cobrança em ${date(me.renovaEm)}.`;
  if (me.status === 'cancelada' && me.acessoAte) return `Sem novas cobranças. O plano continua até ${date(me.acessoAte)}.`;
  if (me.origem === 'cortesia' && me.acessoAte) return `Cortesia até ${date(me.acessoAte)}.`;
  return '';
}

async function carregar({ mensagem, abrirPlano } = {}) {
  show('carregando', 'Carregando sua assinatura…');
  const [me, { plans, checkout }, user] = await Promise.all([api('/subscription/me'), api('/plans'), api('/user/me')]);
  Object.assign(state, { me, plans, checkout, usuario: user });

  const recorrenteAtiva = me.origem === 'assinatura' && me.modalidade === 'recorrente' && ['ativa', 'pausada'].includes(me.status);
  const avulsoAtivo = me.origem === 'assinatura' && me.modalidade === 'avulso';
  const pronto = checkout.enabled && checkout.publicKey;

  $('#atual').innerHTML = `<div class="row"><div>
      <p class="muted" style="margin:0">Olá, ${esc(user.nome?.split(' ')[0] ?? '')}! Seu plano atual é</p>
      <h1 style="margin:4px 0">${esc(me.plano.nome)} ${statusAtual(me)}</h1>
      ${linhaStatus(me) ? `<p class="muted" style="margin:0">${esc(linhaStatus(me))}</p>` : ''}
      ${me.assinatura?.inadimplente ? '<p class="muted" style="margin:0">Não conseguimos cobrar a última mensalidade no cartão. Assine de novo com outro cartão ou pague com Pix.</p>' : ''}
    </div>
    ${recorrenteAtiva ? '<button class="btn danger" type="button" id="cancelar">Cancelar cobrança automática</button>' : ''}</div>`;

  $('#planos').innerHTML = plans
    .filter((p) => p.id !== 'gratuito')
    .map((p) => {
      const atual = me.plano.id === p.id && me.origem === 'assinatura';
      let acao;
      if (atual && recorrenteAtiva) acao = '<span class="badge ok" style="justify-self:start">Seu plano atual</span>';
      else {
        const texto = atual && avulsoAtivo ? 'Pagar mais 1 mês' : me.plano.id !== 'gratuito' && me.origem === 'assinatura' ? `Mudar para ${p.nome}` : `Assinar ${p.nome}`;
        acao = `<button class="btn primary block" type="button" data-plano="${esc(p.id)}" ${pronto ? '' : 'disabled'}><span class="label">${esc(texto)}</span></button>`;
      }
      return `<article class="card plano ${p.destaque ? 'destaque' : ''}">
        <div class="row"><h2>${esc(p.nome)}</h2>${p.destaque ? '<span class="badge">mais completo</span>' : ''}</div>
        <div class="preco">${brl(p.preco)} <small>/mês</small></div>
        <p class="muted" style="margin:0">${esc(p.descricao)}</p>
        <ul>${limitsList(p)}</ul>
        ${acao}
      </article>`;
    })
    .join('');

  show('planos');
  if (mensagem) alerta(mensagem.tipo, mensagem.texto);
  else if (!checkout.enabled) alerta('aviso', 'A assinatura on-line está temporariamente indisponível. Fale com o suporte.');
  else if (!checkout.publicKey) alerta('aviso', 'O pagamento on-line ainda está sendo configurado. Tente mais tarde ou fale com o suporte.');
  else alerta(null);

  document.querySelectorAll('[data-plano]').forEach((b) => b.addEventListener('click', () => abrirPagamento(b.dataset.plano)));
  $('#cancelar')?.addEventListener('click', () => $('#dlg-cancelar').showModal());

  const alvo = abrirPlano ?? planoDaUrl;
  if (alvo && pronto && $(`[data-plano="${CSS.escape(alvo)}"]`)) abrirPagamento(alvo);
}

// ------------------------------------------------------------------ Mercado Pago (Bricks)

let sdkPromise;
function carregarSdk() {
  if (window.MercadoPago) return Promise.resolve();
  sdkPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SDK_URL;
    s.async = true;
    const timer = setTimeout(() => reject(new Error('timeout')), 20000);
    s.onload = () => {
      clearTimeout(timer);
      if (window.MercadoPago) resolve();
      else reject(new Error('sdk'));
    };
    s.onerror = () => {
      clearTimeout(timer);
      reject(new Error('rede'));
    };
    document.head.appendChild(s);
  }).catch((err) => {
    sdkPromise = undefined;
    throw err;
  });
  return sdkPromise;
}

function desmontarBrick() {
  try {
    state.brick?.unmount();
  } catch {
    /* já desmontado */
  }
  state.brick = null;
  $('#brick').innerHTML = '';
}

const temaEscuro = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches;

function abrirPagamento(planoId) {
  const plano = state.plans.find((p) => p.id === planoId);
  if (!plano) return;
  state.plano = plano;
  const { metodos, diasAvulso } = state.checkout;
  $('#pg-plano').textContent = `${plano.nome} · ${brl(plano.preco)}/mês`;
  $('#dias-avulso').textContent = diasAvulso ?? 30;

  // Quem já paga mês a mês este plano vai direto para "pagar mais 1 mês".
  const renovando = state.me.modalidade === 'avulso' && state.me.plano.id === planoId && state.me.origem === 'assinatura';
  $('[data-modo="recorrente"]').hidden = !metodos.recorrente;
  $('[data-modo="avulso"]').hidden = !metodos.avulso;
  $('#modos').hidden = !(metodos.recorrente && metodos.avulso);
  const modo = !metodos.recorrente ? 'avulso' : !metodos.avulso ? 'recorrente' : renovando ? 'avulso' : state.modo ?? 'recorrente';
  document.querySelector(`input[name=modo][value="${modo}"]`).checked = true;

  alerta(null);
  show('pagamento');
  montarBrick(modo);
}

async function montarBrick(modo) {
  state.modo = modo;
  desmontarBrick();
  $('#brick-erro').hidden = true;
  $('#brick-loading').hidden = false;
  try {
    await carregarSdk();
  } catch {
    $('#brick-loading').hidden = true;
    $('#brick-erro-txt').textContent =
      'Não foi possível carregar o pagamento do Mercado Pago. Verifique sua internet, desative bloqueadores de anúncio e tente de novo.';
    $('#brick-erro').hidden = false;
    return;
  }
  if (state.modo !== modo || $('#tela-pagamento').hidden) return; // usuário mudou de opção enquanto carregava

  const mp = new window.MercadoPago(state.checkout.publicKey, { locale: 'pt-BR' });
  const bricks = mp.bricks();
  const comum = {
    initialization: { amount: state.plano.preco, payer: { email: state.usuario.email } },
    callbacks: {
      onReady: () => ($('#brick-loading').hidden = true),
      onError: (error) => {
        console.warn('Mercado Pago:', error?.type, error?.message);
        if (error?.type === 'critical') {
          $('#brick-loading').hidden = true;
          $('#brick-erro-txt').textContent = 'O formulário de pagamento teve um problema. Tente de novo.';
          $('#brick-erro').hidden = false;
        }
      },
    },
  };
  const visual = { style: { theme: temaEscuro() ? 'dark' : 'default' }, hidePaymentButton: false };

  try {
    state.brick =
      modo === 'recorrente'
        ? await bricks.create('cardPayment', 'brick', {
            ...comum,
            customization: {
              visual,
              paymentMethods: { minInstallments: 1, maxInstallments: 1, types: { excluded: ['debit_card', 'prepaid_card'] } },
            },
            callbacks: { ...comum.callbacks, onSubmit: (formData) => pagarRecorrente(formData) },
          })
        : await bricks.create('payment', 'brick', {
            ...comum,
            initialization: { ...comum.initialization, payer: { ...comum.initialization.payer, entityType: 'individual' } },
            customization: {
              visual,
              paymentMethods: { creditCard: 'all', debitCard: 'all', bankTransfer: ['pix'], maxInstallments: 1 },
            },
            callbacks: { ...comum.callbacks, onSubmit: ({ formData }) => pagarAvulso(formData) },
          });
  } catch (err) {
    console.warn(err);
    $('#brick-loading').hidden = true;
    $('#brick-erro-txt').textContent = 'Não foi possível abrir o pagamento. Confira se a chave pública do Mercado Pago está configurada.';
    $('#brick-erro').hidden = false;
  }
}

/** Falha no envio: mostra o motivo e recria o formulário limpo. */
function falhaPagamento(texto) {
  overlay(null);
  alerta('erro', texto);
  setTimeout(() => montarBrick(state.modo), 0);
}

async function pagarRecorrente(formData) {
  overlay('Confirmando o cartão com o Mercado Pago…');
  try {
    const r = await api('/subscription/checkout', {
      method: 'POST',
      body: { planoId: state.plano.id, cardTokenId: formData.token, payerEmail: isEmail(formData.payer?.email) ? formData.payer.email : undefined },
    });
    overlay(null);
    if (r.assinatura?.status === 'ativa') {
      resultado('ok', 'Assinatura ativa!', `O plano ${state.plano.nome} já está liberado no app. A cobrança de ${brl(state.plano.preco)} é automática todo mês no seu cartão${r.assinatura.proximaCobrancaEm ? ` (próxima em ${date(r.assinatura.proximaCobrancaEm)})` : ''}. Você pode cancelar quando quiser.`);
    } else {
      resultado('info', 'Pagamento em processamento', 'O Mercado Pago está confirmando o seu cartão. Assim que for aprovado, o plano muda sozinho no app e avisamos por e-mail.');
    }
  } catch (err) {
    if (err.status !== 401) falhaPagamento(err.message);
    else overlay(null);
  }
}

async function pagarAvulso(formData) {
  overlay(formData?.payment_method_id === 'pix' ? 'Gerando o Pix…' : 'Processando o pagamento…');
  try {
    const r = await api('/subscription/pay', { method: 'POST', body: { planoId: state.plano.id, formData } });
    overlay(null);
    tratarPagamento(r.pagamento);
  } catch (err) {
    if (err.status !== 401) falhaPagamento(err.message);
    else overlay(null);
  }
}

// ------------------------------------------------------------------ resultado

function resultado(tipo, titulo, texto, { pix } = {}) {
  const icones = { ok: '✓', info: 'i', aviso: '!', bad: '×' };
  $('#res-icone').className = `icone ${tipo}`;
  $('#res-icone').textContent = icones[tipo] ?? '';
  $('#res-titulo').textContent = titulo;
  $('#res-texto').textContent = texto;
  $('#pix').hidden = !pix;
  $('#res-acoes').innerHTML =
    tipo === 'ok'
      ? '<a class="btn primary" href="obrafacil://planos">Abrir o app</a><button class="btn" type="button" data-voltar>Ver meu plano</button>'
      : '<button class="btn" type="button" data-voltar>Voltar aos planos</button>';
  $('#res-acoes [data-voltar]').addEventListener('click', () => carregar().catch((e) => alerta('erro', e.message)));
  alerta(null);
  show('resultado');
}

async function tratarPagamento(p) {
  if (p.status === 'approved') {
    const me = await api('/subscription/me').catch(() => null);
    const ate = me?.acessoAte ? ` até ${date(me.acessoAte)}` : '';
    resultado('ok', 'Pagamento aprovado!', `O plano ${state.plano?.nome ?? ''} está liberado${ate}. Não há cobrança automática: avisaremos por e-mail antes de vencer.`);
    return;
  }
  if (p.status === 'pending' && p.pix) {
    mostrarPix(p);
    return;
  }
  if (['pending', 'in_process', 'authorized'].includes(p.status)) {
    resultado('info', 'Pagamento em análise', `${p.mensagem} O plano muda sozinho no app assim que for aprovado.`);
    return;
  }
  // Recusado: volta ao formulário com o motivo.
  show('pagamento');
  falhaPagamento(p.mensagem);
}

function mostrarPix(p) {
  resultado('info', 'Pague com Pix', `Abra o app do seu banco, escolha Pix e leia o QR Code ou use o código copia e cola. Valor: ${brl(p.valor)}.`, { pix: true });
  $('#pix-qr').src = `data:image/png;base64,${p.pix.qrCodeBase64}`;
  $('#pix-codigo').value = p.pix.qrCode;
  $('#pix-expira').textContent = p.pix.expiraEm ? `O código vale até ${time(p.pix.expiraEm)} de ${date(p.pix.expiraEm)}.` : '';
  iniciarPix(p._id, p.pix.expiraEm);
}

function pararPix() {
  clearInterval(state.pixTimer);
  state.pixTimer = null;
}

function iniciarPix(id, expiraEm) {
  pararPix();
  const limite = expiraEm ? new Date(expiraEm).getTime() + 5 * 60000 : Date.now() + 35 * 60000;
  const verificar = async () => {
    try {
      const r = await api(`/subscription/payment/${encodeURIComponent(id)}`);
      if (r.pagamento.status === 'pending' && Date.now() < limite) return;
      pararPix();
      if (r.pagamento.status === 'pending') {
        resultado('aviso', 'Pix expirado', 'O tempo para pagar este Pix acabou. Se você já pagou, aguarde alguns minutos e confira o plano no app; senão, gere um novo Pix.');
      } else if (['rejected', 'cancelled'].includes(r.pagamento.status)) {
        resultado('aviso', 'Pix não pago', 'Este Pix expirou ou foi cancelado. Gere um novo para continuar.');
      } else {
        await tratarPagamento(r.pagamento);
      }
    } catch {
      /* tenta de novo no próximo ciclo */
    }
  };
  state.pixTimer = setInterval(verificar, 5000);
  state.pixVerificar = verificar;
}

// ------------------------------------------------------------------ eventos

$('#ver-senha').addEventListener('click', (e) => {
  const input = $('#login input[name=senha]');
  const ver = input.type === 'password';
  input.type = ver ? 'text' : 'password';
  e.target.textContent = ver ? 'Ocultar' : 'Mostrar';
  e.target.setAttribute('aria-label', ver ? 'Ocultar senha' : 'Mostrar senha');
});

$('#login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value.trim();
  const senha = f.senha.value;
  if (!isEmail(email)) return alerta('erro', 'Informe um e-mail válido.');
  if (!senha) return alerta('erro', 'Informe sua senha.');

  const btn = $('#btn-entrar');
  botao(btn, true, 'Entrando…');
  alerta(null);
  const slow = setTimeout(() => alerta('info', 'Conectando ao servidor… isso pode levar até 1 minuto na primeira vez.'), 5000);
  try {
    const r = await api('/auth/login', { method: 'POST', body: { email, senha } });
    clearTimeout(slow);
    store.set(KEY, r.accessToken);
    f.reset();
    await carregar({ mensagem: planoDaUrl ? null : { tipo: 'ok', texto: 'Pronto! Escolha o plano abaixo.' } });
  } catch (err) {
    clearTimeout(slow);
    alerta('erro', err.code === 'EMAIL_NOT_VERIFIED' ? 'Confirme seu e-mail no app antes de assinar (enviamos um código para você).' : err.message);
  } finally {
    botao(btn, false, 'Entrar');
  }
});

$('#sair').addEventListener('click', () => {
  store.set(KEY, null);
  alerta('info', 'Você saiu.');
  show('login');
});

$('#trocar-plano').addEventListener('click', () => {
  show('planos');
  alerta(null);
});

$('#modos').addEventListener('change', (e) => {
  if (e.target.name === 'modo') {
    alerta(null);
    montarBrick(e.target.value);
  }
});

$('#brick-tentar').addEventListener('click', () => montarBrick(state.modo));

$('#pix-copiar').addEventListener('click', async () => {
  const input = $('#pix-codigo');
  try {
    await navigator.clipboard.writeText(input.value);
  } catch {
    input.select();
    document.execCommand?.('copy');
  }
  $('#pix-copiar').textContent = 'Copiado!';
  setTimeout(() => ($('#pix-copiar').textContent = 'Copiar'), 2500);
});

$('#pix-verificar').addEventListener('click', async () => {
  const btn = $('#pix-verificar');
  botao(btn, true, 'Verificando…');
  await state.pixVerificar?.();
  botao(btn, false, 'Já paguei');
  if (state.pixTimer) alerta('info', 'Ainda não recebemos a confirmação. Pode levar alguns segundos depois do pagamento.');
});

// Voltou para a aba (ex.: pagou o Pix no app do banco): confere na hora.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.pixTimer) state.pixVerificar?.();
});

$('#dlg-voltar').addEventListener('click', () => $('#dlg-cancelar').close());
$('#dlg-confirmar').addEventListener('click', async () => {
  const btn = $('#dlg-confirmar');
  botao(btn, true, 'Cancelando…');
  try {
    await api('/subscription/cancel', { method: 'POST' });
    $('#dlg-cancelar').close();
    await carregar({ mensagem: { tipo: 'ok', texto: 'Cobrança automática cancelada. Não haverá novas cobranças.' } });
  } catch (err) {
    $('#dlg-cancelar').close();
    alerta('erro', err.message);
  } finally {
    botao(btn, false, 'Cancelar assinatura');
  }
});

window.addEventListener('pageshow', () => overlay(null));

// ------------------------------------------------------------------ início

if (store.get(KEY)) {
  carregar().catch((err) => {
    if (err.status !== 401) {
      show('login');
      alerta('erro', err.message);
    }
  });
} else {
  show('login');
}
