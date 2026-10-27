/* Página web de assinatura (Mercado Pago). Usa a mesma API do app. */

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const brl = (n) => Number(n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
const LIMITS = {
  clientes: ['clientes', 'Clientes ilimitados'],
  orcamentos: ['orçamentos ativos', 'Orçamentos ilimitados'],
  obras: ['obras ativas', 'Obras ilimitadas'],
  produtos: ['itens no catálogo', 'Catálogo ilimitado'],
};

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
  for (const t of ['login', 'planos', 'carregando']) $(`#tela-${t}`).hidden = t !== tela;
  $('#sair').hidden = tela !== 'planos';
  clearTimeout(dicaTimer);
  if (tela === 'carregando') {
    $('#carregando-txt').textContent = msg ?? 'Carregando…';
    $('#carregando-dica').hidden = true;
    // Servidor "acordando": avisa que pode demorar.
    dicaTimer = setTimeout(() => ($('#carregando-dica').hidden = false), 5000);
  }
  if (tela === 'login') etapa(1);
  if (tela === 'planos') etapa(2);
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

// ------------------------------------------------------------------ telas

function limitsList(plan) {
  return Object.entries(LIMITS)
    .map(([k, [label, ilimitado]]) => `<li>${plan.limites[k] == null ? ilimitado : `Até ${plan.limites[k]} ${label}`}</li>`)
    .join('');
}

function statusAtual(me) {
  if (me.origem === 'cortesia') return `<span class="badge">cortesia</span>`;
  if (me.status === 'ativa' && me.assinatura?.inadimplente) return `<span class="badge bad">pagamento pendente</span>`;
  if (me.status === 'ativa') return `<span class="badge ok">ativo</span>`;
  if (me.status === 'cancelada') return `<span class="badge aviso">cancelado</span>`;
  return '';
}

let usuarioEmail = '';

async function carregar({ mensagem } = {}) {
  show('carregando', 'Carregando sua assinatura…');
  const [me, { plans, checkout }, user] = await Promise.all([api('/subscription/me'), api('/plans'), api('/user/me')]);
  usuarioEmail = user.email;
  const payerInput = $('#payer-email');
  if (!payerInput.value) payerInput.value = store.get('of_payer_email') || user.email;

  const ativa = me.assinatura && ['ativa', 'pausada'].includes(me.assinatura.status);
  const pendente = me.pendente?.initPoint && !ativa;

  $('#atual').innerHTML = `<div class="row"><div>
      <p class="muted" style="margin:0">Olá, ${esc(user.nome?.split(' ')[0] ?? '')}! Seu plano atual é</p>
      <h1 style="margin:4px 0">${esc(me.plano.nome)} ${statusAtual(me)}</h1>
      ${me.renovaEm ? `<p class="muted" style="margin:0">Próxima cobrança em ${date(me.renovaEm)}.</p>` : ''}
      ${me.status === 'cancelada' && me.acessoAte ? `<p class="muted" style="margin:0">Sem novas cobranças. O plano continua até ${date(me.acessoAte)}.</p>` : ''}
      ${me.assinatura?.inadimplente ? '<p class="muted" style="margin:0">O Mercado Pago não conseguiu cobrar a última mensalidade. Confira o cartão na sua conta do Mercado Pago.</p>' : ''}
    </div>
    ${ativa ? '<button class="btn danger" type="button" id="cancelar">Cancelar assinatura</button>' : ''}</div>
    ${pendente ? `<div class="alert aviso" style="margin-top:14px">Você tem um pagamento do plano ${esc(plans.find((p) => p.id === me.pendente.planoId)?.nome ?? '')} iniciado e não concluído.</div>
      <a class="btn primary" style="margin-top:10px" href="${esc(me.pendente.initPoint)}" rel="noopener">Continuar pagamento</a>` : ''}`;

  $('#planos').innerHTML = plans
    .filter((p) => p.id !== 'gratuito')
    .map((p) => {
      const atual = me.plano.id === p.id && ativa;
      return `<article class="card plano ${p.destaque ? 'destaque' : ''}">
        <div class="row"><h2>${esc(p.nome)}</h2>${p.destaque ? '<span class="badge">mais completo</span>' : ''}</div>
        <div class="preco">${brl(p.preco)} <small>/mês</small></div>
        <p class="muted" style="margin:0">${esc(p.descricao)}</p>
        <ul>${limitsList(p)}</ul>
        ${
          atual
            ? '<span class="badge ok" style="justify-self:start">Seu plano atual</span>'
            : `<button class="btn primary block" type="button" data-plano="${esc(p.id)}" data-nome="${esc(p.nome)}" ${checkout.enabled ? '' : 'disabled'}>
                 <span class="spinner" aria-hidden="true"></span><span class="label">${me.plano.id !== 'gratuito' && ativa ? 'Mudar para' : 'Assinar'} ${esc(p.nome)}</span>
               </button>`
        }
      </article>`;
    })
    .join('');

  show('planos');
  if (mensagem) alerta(mensagem.tipo, mensagem.texto);
  else if (!checkout.enabled) alerta('aviso', 'A assinatura on-line está temporariamente indisponível. Fale com o suporte.');
  else alerta(null);

  document.querySelectorAll('[data-plano]').forEach((b) => b.addEventListener('click', () => assinar(b)));
  $('#cancelar')?.addEventListener('click', () => $('#dlg-cancelar').showModal());
}

async function assinar(btn) {
  const payer = $('#payer-email');
  const email = payer.value.trim().toLowerCase();
  if (!isEmail(email)) {
    payer.setAttribute('aria-invalid', 'true');
    payer.focus();
    alerta('erro', 'Informe o e-mail da sua conta do Mercado Pago.');
    return;
  }
  payer.removeAttribute('aria-invalid');
  store.set('of_payer_email', email === usuarioEmail ? null : email);

  alerta(null);
  document.querySelectorAll('[data-plano]').forEach((b) => (b.disabled = true));
  botao(btn, true, 'Criando pagamento seguro…');
  try {
    const r = await api('/subscription/checkout', { method: 'POST', body: { planoId: btn.dataset.plano, payerEmail: email } });
    etapa(3);
    overlay(`Abrindo o Mercado Pago para pagar o plano ${btn.dataset.nome}…`);
    location.href = r.initPoint;
  } catch (err) {
    botao(btn, false, `Assinar ${btn.dataset.nome}`);
    document.querySelectorAll('[data-plano]').forEach((b) => (b.disabled = false));
    if (err.status !== 401) alerta('erro', err.message);
  }
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
    await carregar({ mensagem: { tipo: 'ok', texto: 'Pronto! Escolha o plano abaixo.' } });
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

$('#dlg-voltar').addEventListener('click', () => $('#dlg-cancelar').close());
$('#dlg-confirmar').addEventListener('click', async () => {
  const btn = $('#dlg-confirmar');
  botao(btn, true, 'Cancelando…');
  try {
    await api('/subscription/cancel', { method: 'POST' });
    $('#dlg-cancelar').close();
    await carregar({ mensagem: { tipo: 'ok', texto: 'Assinatura cancelada. Não haverá novas cobranças.' } });
  } catch (err) {
    $('#dlg-cancelar').close();
    alerta('erro', err.message);
  } finally {
    botao(btn, false, 'Cancelar assinatura');
  }
});

// Voltou do Mercado Pago pelo botão "voltar" do navegador: tira o overlay.
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
