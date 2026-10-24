/* Página web de assinatura (Mercado Pago). Usa a mesma API do app. */

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const brl = (n) => Number(n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '');
const LIMITS = { clientes: 'clientes', orcamentos: 'orçamentos ativos', obras: 'obras ativas', produtos: 'itens no catálogo' };

// Token só nesta aba (sessionStorage); some ao fechar o navegador.
const KEY = 'of_assinar_token';
const getToken = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const setToken = (t) => {
  try {
    if (t) sessionStorage.setItem(KEY, t);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* navegador sem storage */
  }
};

async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const res = await fetch(path, {
    method,
    headers: {
      'X-Platform': 'web',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') {
    setToken(null);
    show('login');
  }
  if (!res.ok) throw Object.assign(new Error(data.message || 'Não foi possível concluir.'), { status: res.status, code: data.code });
  return data;
}

function show(tela) {
  $('#tela-login').hidden = tela !== 'login';
  $('#tela-planos').hidden = tela !== 'planos';
  $('#sair').hidden = tela !== 'planos';
}

function limitsList(plan) {
  return Object.entries(LIMITS)
    .map(([k, label]) => `<li>${plan.limites[k] == null ? 'Ilimitado' : plan.limites[k]} ${label}</li>`)
    .join('');
}

async function carregar() {
  $('#erro').textContent = '';
  const [me, { plans, checkout }] = await Promise.all([api('/subscription/me'), api('/plans')]);
  show('planos');

  const ativa = me.assinatura && ['ativa', 'pausada'].includes(me.assinatura.status);
  $('#atual').innerHTML = `<div class="row"><div>
      <p class="muted" style="margin:0">Seu plano atual</p>
      <h1>${esc(me.plano.nome)} ${me.origem === 'cortesia' ? '<span class="badge">cortesia</span>' : ''}</h1>
      ${me.renovaEm ? `<p class="muted">Renova em ${date(me.renovaEm)}</p>` : ''}
      ${me.acessoAte && me.status === 'cancelada' ? `<p class="muted">Cancelado · acesso até ${date(me.acessoAte)}</p>` : ''}
      ${me.assinatura?.inadimplente ? '<p class="erro">Não conseguimos cobrar a última mensalidade. Confira seu cartão no Mercado Pago.</p>' : ''}
    </div>
    ${ativa ? '<button class="btn danger" id="cancelar">Cancelar assinatura</button>' : ''}</div>`;

  $('#planos').innerHTML = plans
    .filter((p) => p.id !== 'gratuito')
    .map((p) => {
      const atual = me.plano.id === p.id && ativa;
      return `<article class="card plano ${p.destaque ? 'destaque' : ''}">
        <div class="row"><h2>${esc(p.nome)}</h2>${p.destaque ? '<span class="badge">mais completo</span>' : ''}</div>
        <div class="preco">${brl(p.preco)} <small>/mês</small></div>
        <p class="muted" style="margin:0">${esc(p.descricao)}</p>
        <ul>${limitsList(p)}</ul>
        ${atual ? '<span class="badge ok">Seu plano</span>' : `<button class="btn primary" data-plano="${esc(p.id)}" ${checkout.enabled ? '' : 'disabled'}>Assinar ${esc(p.nome)}</button>`}
      </article>`;
    })
    .join('');
  if (!checkout.enabled) $('#erro').textContent = 'A assinatura on-line está temporariamente indisponível. Fale com o suporte.';

  document.querySelectorAll('[data-plano]').forEach((b) =>
    b.addEventListener('click', async () => {
      b.disabled = true;
      b.textContent = 'Abrindo o Mercado Pago…';
      try {
        const r = await api('/subscription/checkout', { method: 'POST', body: { planoId: b.dataset.plano } });
        location.href = r.initPoint;
      } catch (err) {
        $('#erro').textContent = err.message;
        b.disabled = false;
        b.textContent = 'Tentar novamente';
      }
    }),
  );

  $('#cancelar')?.addEventListener('click', async (e) => {
    if (!confirm('Cancelar a assinatura? Não haverá novas cobranças e o plano continua até o fim do período pago.')) return;
    e.target.disabled = true;
    try {
      await api('/subscription/cancel', { method: 'POST' });
      await carregar();
    } catch (err) {
      $('#erro').textContent = err.message;
      e.target.disabled = false;
    }
  });
}

$('#login').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#login-erro').textContent = '';
  const f = new FormData(e.target);
  try {
    const r = await api('/auth/login', { method: 'POST', body: { email: f.get('email'), senha: f.get('senha') } });
    setToken(r.accessToken);
    e.target.reset();
    await carregar();
  } catch (err) {
    $('#login-erro').textContent = err.message;
  }
});

$('#sair').addEventListener('click', () => {
  setToken(null);
  show('login');
});

if (getToken()) carregar().catch(() => show('login'));
else show('login');
