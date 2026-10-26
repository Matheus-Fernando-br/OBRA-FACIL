/* Painel administrativo do Obra Fácil (sem dependências além do Chart.js). */

const $ = (sel, root = document) => root.querySelector(sel);
const content = $('#content');

// ------------------------------------------------------------------ utilidades

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const brl = (n) => Number(n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (n) => Number(n ?? 0).toLocaleString('pt-BR');
const date = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');
const dateTime = (d) => (d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const PLAN_NAMES = { gratuito: 'Gratuito', basico: 'Básico', profissional: 'Profissional' };
const planName = (id) => PLAN_NAMES[id] ?? id ?? 'Gratuito';

const SUB_BADGE = {
  ativa: ['ok', 'Ativa'],
  pendente: ['warn', 'Pendente'],
  pausada: ['warn', 'Pausada'],
  cancelada: ['', 'Cancelada'],
  expirada: ['', 'Expirada'],
  suspeita: ['bad', 'Suspeita'],
};
const PAY_BADGE = { approved: ['ok', 'Aprovado'], rejected: ['bad', 'Recusado'], recycling: ['warn', 'Retentativa'], pending: ['warn', 'Pendente'], cancelled: ['', 'Cancelado'] };
const HOOK_BADGE = { processado: ['ok', 'Processado'], ignorado: ['', 'Ignorado'], erro: ['bad', 'Erro'], rejeitado: ['bad', 'Rejeitado'], recebido: ['warn', 'Recebido'] };
const badge = (map, key) => {
  const [cls, label] = map[key] ?? ['', key ?? '—'];
  return `<span class="badge ${cls}">${esc(label)}</span>`;
};

function toast(msg, bad = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${bad ? ' bad' : ''}`;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 3500);
}

class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Erro ${status}`);
    this.status = status;
    this.code = body?.code;
  }
}

async function api(path, { method = 'GET', body, query } = {}) {
  const url = new URL(`/admin/api${path}`, location.origin);
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== '') url.searchParams.set(k, v);
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'X-Admin-Request': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status === 401 && data?.code === 'ADMIN_LOGIN_REQUIRED') {
    showView('login');
    throw new ApiError(401, data);
  }
  if (res.status === 403 && data?.code === 'PASSWORD_CHANGE_REQUIRED') {
    showView('password');
    throw new ApiError(403, data);
  }
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function openModal(html, onMount) {
  const modal = $('#modal');
  $('#modal-body').innerHTML = `<div class="modal-inner">${html}</div>`;
  modal.showModal();
  $('#modal-body').querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => modal.close()));
  onMount?.($('#modal-body'));
}
const closeModal = () => $('#modal').close();

async function confirmAction(title, text, fn, { danger = false, confirmLabel = 'Confirmar' } = {}) {
  openModal(
    `<h3>${esc(title)}</h3><p class="muted">${text}</p>
     <div class="actions" style="justify-content:flex-end"><button class="btn" data-close>Voltar</button>
     <button class="btn ${danger ? 'danger' : 'primary'}" id="confirm-ok">${esc(confirmLabel)}</button></div>`,
    (root) => {
      $('#confirm-ok', root).addEventListener('click', async (e) => {
        e.target.disabled = true;
        try {
          await fn();
          closeModal();
        } catch (err) {
          toast(err.message, true);
          e.target.disabled = false;
        }
      });
    },
  );
}

function pager(data, onPage) {
  const div = document.createElement('div');
  div.className = 'pager';
  div.innerHTML = `<span>${num(data.total)} registro(s)</span>
    <div class="actions"><button class="btn small" data-p="prev" ${data.page <= 1 ? 'disabled' : ''}>Anterior</button>
    <span>Página ${data.page} de ${Math.max(data.pages, 1)}</span>
    <button class="btn small" data-p="next" ${data.page >= data.pages ? 'disabled' : ''}>Próxima</button></div>`;
  div.querySelector('[data-p=prev]').addEventListener('click', () => onPage(data.page - 1));
  div.querySelector('[data-p=next]').addEventListener('click', () => onPage(data.page + 1));
  return div;
}

const charts = [];
function chart(canvas, config) {
  if (!window.Chart) return;
  const css = getComputedStyle(document.documentElement);
  Chart.defaults.color = css.getPropertyValue('--muted').trim();
  Chart.defaults.borderColor = css.getPropertyValue('--line').trim();
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  charts.push(new Chart(canvas, config));
}
function destroyCharts() {
  while (charts.length) charts.pop().destroy();
}
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// ------------------------------------------------------------------ views

function showView(name) {
  $('#view-login').hidden = name !== 'login';
  $('#view-password').hidden = name !== 'password';
  $('#view-app').hidden = name !== 'app';
}

const routes = {
  dashboard: ['Visão geral', renderDashboard],
  usuarios: ['Usuários', renderUsers],
  assinaturas: ['Assinaturas', renderSubscriptions],
  pagamentos: ['Pagamentos', renderPayments],
  planos: ['Planos e cobrança', renderPlans],
  integracoes: ['Integrações', renderIntegrations],
  diagnostico: ['Diagnóstico', renderDiagnostics],
  auditoria: ['Auditoria', renderAudit],
  webhooks: ['Webhooks', renderWebhooks],
  conta: ['Minha conta', renderAccount],
};

async function route() {
  const [name, param] = location.hash.replace(/^#\//, '').split('/');
  const key = routes[name] ? name : 'dashboard';
  const [title, render] = routes[key];
  $('#page-title').textContent = title;
  document.title = `${title} · Obra Fácil`;
  document.querySelectorAll('.sidebar a[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === key));
  $('#sidebar').classList.remove('open');
  destroyCharts();
  content.innerHTML = '<div class="card"><p class="muted">Carregando…</p></div>';
  try {
    await render(param);
  } catch (err) {
    if (err.status !== 401 && err.code !== 'PASSWORD_CHANGE_REQUIRED') {
      content.innerHTML = `<div class="alert bad">${esc(err.message)}</div>`;
    }
  }
}

// ---------- visão geral

async function renderDashboard() {
  const d = await api('/dashboard');
  const pctVerif = d.usuarios.total ? Math.round((d.usuarios.verificados / d.usuarios.total) * 100) : 0;
  content.innerHTML = `
    <div class="grid kpis">
      ${kpi('Usuários', num(d.usuarios.total), `+${num(d.usuarios.novos7)} em 7 dias · +${num(d.usuarios.novos30)} em 30`)}
      ${kpi('Ativos (30 dias)', num(d.usuarios.ativos30), `${pctVerif}% com e-mail verificado`)}
      ${kpi('Assinaturas ativas', num(d.assinaturas.ativas), `${num(d.assinaturas.inadimplentes)} inadimplente(s)`)}
      ${kpi('Receita recorrente (MRR)', brl(d.receita.mrr), `${brl(d.receita.ultimos30)} recebidos em 30 dias`)}
      ${kpi('Cancelamentos (30 dias)', num(d.assinaturas.canceladas30), '')}
      ${kpi('Orçamentos', num(d.uso.orcamentos), `${d.uso.mediaOrcamentosPorUsuario} por usuário`)}
    </div>
    <div class="grid two">
      <div class="card"><h3>Cadastros e orçamentos (30 dias)</h3><div class="chart-box"><canvas id="c-daily"></canvas></div></div>
      <div class="card"><h3>Usuários por plano</h3><div class="chart-box"><canvas id="c-plans"></canvas></div></div>
    </div>
    <div class="grid two">
      <div class="card"><h3>Receita por mês (12 meses)</h3><div class="chart-box"><canvas id="c-revenue"></canvas></div></div>
      <div class="card"><h3>Uso da plataforma</h3>
        <div class="status-row"><span>Clientes</span><strong>${num(d.uso.clientes)}</strong></div>
        <div class="status-row"><span>Orçamentos</span><strong>${num(d.uso.orcamentos)}</strong></div>
        <div class="status-row"><span>Obras</span><strong>${num(d.uso.obras)}</strong></div>
        <div class="status-row"><span>Itens no catálogo</span><strong>${num(d.uso.produtos)}</strong></div>
        <div class="status-row"><span>Contas bloqueadas</span><strong>${num(d.usuarios.bloqueados)}</strong></div>
      </div>
    </div>`;

  const labels = d.series.dias.map((s) => s.slice(8, 10) + '/' + s.slice(5, 7));
  chart($('#c-daily'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Cadastros', data: d.series.cadastros, borderColor: cssVar('--accent'), backgroundColor: cssVar('--accent-soft'), fill: true, cubicInterpolationMode: 'monotone', pointRadius: 0 },
        { label: 'Orçamentos', data: d.series.orcamentos, borderColor: cssVar('--info'), cubicInterpolationMode: 'monotone', pointRadius: 0 },
      ],
    },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
  chart($('#c-plans'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(d.planos).map(planName),
      datasets: [{ data: Object.values(d.planos), backgroundColor: [cssVar('--muted'), cssVar('--info'), cssVar('--accent')], borderWidth: 0 }],
    },
    options: { maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } },
  });
  chart($('#c-revenue'), {
    type: 'bar',
    data: {
      labels: d.receita.porMes.map((m) => `${m.mes.slice(5)}/${m.mes.slice(2, 4)}`),
      datasets: [{ label: 'Receita', data: d.receita.porMes.map((m) => m.total), backgroundColor: cssVar('--ok'), borderRadius: 6 }],
    },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => brl(c.raw) } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => brl(v) } } } },
  });
}

const kpi = (label, value, sub) => `<div class="card kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="sub">${esc(sub)}</div></div>`;

// ---------- usuários

async function renderUsers(id) {
  if (id) return renderUserDetail(id);
  const state = { page: 1, q: '', plano: '', status: '', verificado: '' };
  content.innerHTML = `<div class="card">
    <div class="filters">
      <input id="f-q" type="search" placeholder="Buscar por nome, e-mail ou ID">
      <select id="f-plano"><option value="">Todos os planos</option><option value="gratuito">Gratuito</option><option value="basico">Básico</option><option value="profissional">Profissional</option></select>
      <select id="f-status"><option value="">Qualquer situação</option><option value="ativo">Ativos</option><option value="bloqueado">Bloqueados</option></select>
      <select id="f-verif"><option value="">E-mail: todos</option><option value="sim">Verificado</option><option value="nao">Não verificado</option></select>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Plano</th><th>Situação</th><th>Cadastro</th><th>Último acesso</th></tr></thead><tbody id="rows"></tbody></table></div>
    <div id="pager"></div></div>`;

  async function load() {
    const data = await api('/users', { query: { page: state.page, q: state.q, plano: state.plano, status: state.status, verificado: state.verificado } });
    $('#rows').innerHTML = data.items.length
      ? data.items
          .map(
            (u) => `<tr class="clickable" data-id="${esc(u._id)}">
            <td class="strong">${esc(u.nome)}</td><td>${esc(u.email)}${u.email_verificado ? '' : ' <span class="badge warn">não verificado</span>'}</td>
            <td>${esc(planName(u.planoAtual))}${u.planoManual?.planoId ? ' <span class="badge accent">cortesia</span>' : ''}</td>
            <td>${u.status === 'bloqueado' ? '<span class="badge bad">Bloqueado</span>' : '<span class="badge ok">Ativo</span>'}</td>
            <td>${date(u.createdAt)}</td><td>${dateTime(u.ultimoLoginEm)}</td></tr>`,
          )
          .join('')
      : '<tr><td colspan="6" class="empty">Nenhum usuário encontrado.</td></tr>';
    $('#rows').querySelectorAll('tr[data-id]').forEach((tr) => tr.addEventListener('click', () => (location.hash = `#/usuarios/${tr.dataset.id}`)));
    $('#pager').replaceChildren(pager(data, (p) => ((state.page = p), load())));
  }
  let timer;
  $('#f-q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => ((state.q = e.target.value), (state.page = 1), load()), 300);
  });
  for (const [sel, key] of [['#f-plano', 'plano'], ['#f-status', 'status'], ['#f-verif', 'verificado']]) {
    $(sel).addEventListener('change', (e) => ((state[key] = e.target.value), (state.page = 1), load()));
  }
  await load();
}

async function renderUserDetail(id) {
  const d = await api(`/users/${id}`);
  const u = d.usuario;
  $('#page-title').textContent = u.nome;
  content.innerHTML = `
    <div class="actions"><a class="btn" href="#/usuarios">← Voltar</a></div>
    <div class="grid two">
      <div class="card"><h3>Conta</h3><dl class="kv">
        <dt>Nome</dt><dd>${esc(u.nome)}</dd>
        <dt>E-mail</dt><dd>${esc(u.email)} ${u.email_verificado ? '<span class="badge ok">verificado</span>' : '<span class="badge warn">não verificado</span>'}</dd>
        <dt>Documento</dt><dd>${u.CPF ? 'CPF informado' : u.CNPJ ? 'CNPJ informado' : '—'}</dd>
        <dt>Situação</dt><dd>${u.status === 'bloqueado' ? '<span class="badge bad">Bloqueado</span>' : '<span class="badge ok">Ativo</span>'}</dd>
        <dt>Plano</dt><dd>${esc(planName(u.planoAtual))}${u.planoManual?.planoId ? ` <span class="badge accent">cortesia${u.planoManual.ate ? ' até ' + date(u.planoManual.ate) : ''}</span>` : ''}</dd>
        <dt>Termos aceitos</dt><dd>${dateTime(u.aceiteTermosEm)} ${u.versaoTermos ? `(versão ${esc(u.versaoTermos)})` : ''}</dd>
        <dt>Cadastro</dt><dd>${dateTime(u.createdAt)}</dd>
        <dt>Último acesso</dt><dd>${dateTime(u.ultimoLoginEm)}</dd>
        <dt>ID</dt><dd class="mono">${esc(u._id)}</dd>
      </dl></div>
      <div class="card"><h3>Uso</h3>
        ${['clientes', 'orcamentos', 'obras', 'produtos'].map((k) => `<div class="status-row"><span>${esc({ clientes: 'Clientes', orcamentos: 'Orçamentos ativos', obras: 'Obras ativas', produtos: 'Catálogo' }[k])}</span><strong>${num(d.uso[k])}</strong></div>`).join('')}
      </div>
    </div>
    <div class="card"><h3>Ações</h3><div class="actions">
      <button class="btn" id="a-plan">Conceder plano (cortesia)</button>
      ${u.planoManual?.planoId ? '<button class="btn" id="a-unplan">Remover cortesia</button>' : ''}
      ${u.email_verificado ? '' : '<button class="btn" id="a-verify">Marcar e-mail como verificado</button>'}
      <button class="btn" id="a-password">Alterar senha</button>
      <button class="btn" id="a-logout">Encerrar sessões</button>
      ${u.status === 'bloqueado' ? '<button class="btn" id="a-unblock">Desbloquear</button>' : '<button class="btn danger" id="a-block">Bloquear</button>'}
      <button class="btn danger" id="a-delete">Excluir conta e dados</button>
    </div></div>
    <div class="card"><h3>Assinaturas</h3>${subsTable(d.assinaturas, false)}</div>
    <div class="card"><h3>Pagamentos</h3>${paymentsTable(d.pagamentos, false)}</div>
    <div class="card"><h3>Histórico</h3>${auditTable(d.eventos)}</div>`;

  const reload = () => renderUserDetail(id);
  $('#a-plan')?.addEventListener('click', () =>
    openModal(
      `<h3>Conceder plano</h3><p class="muted">O plano vale independentemente de pagamento até a data escolhida (ou sem prazo).</p>
       <form id="plan-form" class="grid"><label>Plano<select name="planoId"><option value="basico">Básico</option><option value="profissional">Profissional</option></select></label>
       <label>Válido até (opcional)<input type="date" name="ate"></label>
       <label>Motivo<input name="motivo" required placeholder="Ex.: parceria, suporte, teste"></label>
       <div class="actions" style="justify-content:flex-end"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary">Conceder</button></div></form>`,
      (root) =>
        $('#plan-form', root).addEventListener('submit', async (e) => {
          e.preventDefault();
          const f = formData(e.target);
          try {
            await api(`/users/${id}/plan`, { method: 'POST', body: { planoId: f.planoId, motivo: f.motivo, ...(f.ate ? { ate: f.ate } : {}) } });
            closeModal();
            toast('Plano concedido.');
            reload();
          } catch (err) {
            toast(err.message, true);
          }
        }),
    ),
  );
  $('#a-unplan')?.addEventListener('click', () => confirmAction('Remover cortesia', 'O usuário volta ao plano da assinatura (ou Gratuito).', async () => {
    await api(`/users/${id}/plan`, { method: 'DELETE' });
    toast('Cortesia removida.');
    reload();
  }));
  $('#a-verify')?.addEventListener('click', async () => {
    await api(`/users/${id}/verify-email`, { method: 'POST' });
    toast('E-mail marcado como verificado.');
    reload();
  });
  $('#a-password').addEventListener('click', () =>
    openModal(
      `<h3>Alterar senha de ${esc(u.nome)}</h3>
       <p class="muted">Defina uma senha nova (ex.: a pedido do usuário). Todas as sessões dele serão encerradas. Informe a senha ao usuário por um canal seguro e peça para trocá-la no app.</p>
       <form id="pw-form" class="grid" autocomplete="off">
         <label>Nova senha (mínimo 6 caracteres)<input type="password" name="novaSenha" minlength="6" maxlength="128" autocomplete="new-password" required></label>
         <label>Confirmar nova senha<input type="password" name="confirmar" minlength="6" maxlength="128" autocomplete="new-password" required></label>
         <label class="check"><input type="checkbox" name="avisar" checked>Avisar o usuário por e-mail (sem enviar a senha)</label>
         <p class="form-error" id="pw-error" role="alert"></p>
         <div class="actions" style="justify-content:flex-end"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary">Salvar senha</button></div>
       </form>`,
      (root) =>
        $('#pw-form', root).addEventListener('submit', async (e) => {
          e.preventDefault();
          const f = e.target;
          if (f.novaSenha.value !== f.confirmar.value) return ($('#pw-error', root).textContent = 'A confirmação não confere.');
          try {
            await api(`/users/${id}/password`, { method: 'POST', body: { novaSenha: f.novaSenha.value, avisarPorEmail: f.avisar.checked } });
            closeModal();
            toast('Senha alterada e sessões encerradas.');
            reload();
          } catch (err) {
            $('#pw-error', root).textContent = err.message;
          }
        }),
    ),
  );
  $('#a-logout').addEventListener('click', () => confirmAction('Encerrar sessões', 'O usuário precisará entrar novamente em todos os aparelhos.', async () => {
    await api(`/users/${id}/logout-all`, { method: 'POST' });
    toast('Sessões encerradas.');
  }));
  $('#a-block')?.addEventListener('click', () => confirmAction('Bloquear conta', 'O usuário não conseguirá entrar até ser desbloqueado.', async () => {
    await api(`/users/${id}/status`, { method: 'PATCH', body: { status: 'bloqueado' } });
    toast('Conta bloqueada.');
    reload();
  }, { danger: true, confirmLabel: 'Bloquear' }));
  $('#a-unblock')?.addEventListener('click', async () => {
    await api(`/users/${id}/status`, { method: 'PATCH', body: { status: 'ativo' } });
    toast('Conta desbloqueada.');
    reload();
  });
  $('#a-delete').addEventListener('click', () =>
    openModal(
      `<h3>Excluir conta e dados</h3><p class="muted">Use para pedidos de exclusão recebidos por e-mail. Apaga clientes, orçamentos, obras e catálogo e cancela cobranças futuras. <strong>Não pode ser desfeito.</strong></p>
       <form id="del-form" class="grid"><label>Digite o e-mail do usuário para confirmar<input name="confirmacao" autocomplete="off" required placeholder="${esc(u.email)}"></label>
       <label>Motivo (opcional)<input name="motivo" placeholder="Ex.: pedido por e-mail em ${date(new Date())}"></label>
       <div class="actions" style="justify-content:flex-end"><button type="button" class="btn" data-close>Cancelar</button><button class="btn danger">Excluir definitivamente</button></div></form>`,
      (root) =>
        $('#del-form', root).addEventListener('submit', async (e) => {
          e.preventDefault();
          try {
            await api(`/users/${id}`, { method: 'DELETE', body: formData(e.target) });
            closeModal();
            toast('Conta excluída.');
            location.hash = '#/usuarios';
          } catch (err) {
            toast(err.message, true);
          }
        }),
    ),
  );
}

// ---------- assinaturas e pagamentos

function subsTable(items, withUser = true) {
  if (!items.length) return '<p class="empty">Nenhuma assinatura.</p>';
  return `<div class="table-wrap"><table><thead><tr>${withUser ? '<th>Usuário</th>' : ''}<th>Plano</th><th>Valor</th><th>Situação</th><th>Próxima cobrança</th><th>Atualizada</th>${withUser ? '<th></th>' : ''}</tr></thead><tbody>
    ${items
      .map(
        (s) => `<tr>${withUser ? `<td>${s.userId ? `<a href="#/usuarios/${esc(s.userId._id)}">${esc(s.userId.nome)}</a><div class="muted">${esc(s.userId.email)}</div>` : '<span class="muted">conta excluída</span>'}</td>` : ''}
        <td>${esc(planName(s.planoId))}</td><td>${brl(s.valor)}</td>
        <td>${badge(SUB_BADGE, s.status)}${s.inadimplenteDesde ? ' <span class="badge bad">inadimplente</span>' : ''}${s.acessoAte && s.status === 'cancelada' ? `<div class="muted">acesso até ${date(s.acessoAte)}</div>` : ''}${s.observacao ? `<div class="muted">${esc(s.observacao)}</div>` : ''}</td>
        <td>${date(s.proximaCobrancaEm)}</td><td>${dateTime(s.updatedAt)}</td>
        ${withUser ? `<td><div class="actions">${s.providerId ? `<button class="btn small" data-sync="${esc(s._id)}">Sincronizar</button>` : ''}${['ativa', 'pausada', 'pendente'].includes(s.status) ? `<button class="btn small danger" data-cancel="${esc(s._id)}">Cancelar</button>` : ''}</div></td>` : ''}</tr>`,
      )
      .join('')}</tbody></table></div>`;
}

async function renderSubscriptions() {
  const state = { page: 1, status: '', plano: '', q: '' };
  content.innerHTML = `<div class="card"><div class="filters">
      <input id="f-q" type="search" placeholder="Buscar por e-mail, nome ou ID do Mercado Pago">
      <select id="f-status"><option value="">Todas</option><option value="ativa">Ativas</option><option value="inadimplente">Inadimplentes</option><option value="pendente">Pendentes</option><option value="cancelada">Canceladas</option><option value="suspeita">Suspeitas</option><option value="expirada">Expiradas</option></select>
      <select id="f-plano"><option value="">Todos os planos</option><option value="basico">Básico</option><option value="profissional">Profissional</option></select>
      <button class="btn" id="reconcile">Sincronizar tudo com o Mercado Pago</button>
    </div><div id="table"></div><div id="pager"></div></div>`;

  async function load() {
    const data = await api('/subscriptions', { query: state });
    $('#table').innerHTML = subsTable(data.items);
    $('#pager').replaceChildren(pager(data, (p) => ((state.page = p), load())));
    $('#table').querySelectorAll('[data-sync]').forEach((b) =>
      b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          const r = await api(`/subscriptions/${b.dataset.sync}/sync`, { method: 'POST' });
          toast(`Sincronizada: ${r.resultado}`);
          load();
        } catch (err) {
          toast(err.message, true);
          b.disabled = false;
        }
      }),
    );
    $('#table').querySelectorAll('[data-cancel]').forEach((b) =>
      b.addEventListener('click', () =>
        confirmAction('Cancelar assinatura', 'A cobrança recorrente será cancelada no Mercado Pago. O usuário mantém o plano até o fim do período pago.', async () => {
          await api(`/subscriptions/${b.dataset.cancel}/cancel`, { method: 'POST' });
          toast('Assinatura cancelada.');
          load();
        }, { danger: true, confirmLabel: 'Cancelar assinatura' }),
      ),
    );
  }
  let timer;
  $('#f-q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => ((state.q = e.target.value), (state.page = 1), load()), 300);
  });
  $('#f-status').addEventListener('change', (e) => ((state.status = e.target.value), (state.page = 1), load()));
  $('#f-plano').addEventListener('change', (e) => ((state.plano = e.target.value), (state.page = 1), load()));
  $('#reconcile').addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      const r = await api('/jobs/reconcile', { method: 'POST' });
      toast(r.emExecucao ? 'Já está em execução.' : `Concluído: ${r.sincronizadas ?? 0} sincronizadas, ${r.expiradas ?? 0} expiradas.`);
      load();
    } catch (err) {
      toast(err.message, true);
    } finally {
      e.target.disabled = false;
    }
  });
  await load();
}

function paymentsTable(items, withUser = true) {
  if (!items.length) return '<p class="empty">Nenhum pagamento.</p>';
  return `<div class="table-wrap"><table><thead><tr><th>Data</th>${withUser ? '<th>Usuário</th>' : ''}<th>Plano</th><th>Valor</th><th>Situação</th><th>ID Mercado Pago</th></tr></thead><tbody>
    ${items
      .map(
        (p) => `<tr><td>${dateTime(p.data)}</td>${withUser ? `<td>${p.userId ? `<a href="#/usuarios/${esc(p.userId._id)}">${esc(p.userId.nome)}</a>` : '<span class="muted">conta excluída</span>'}</td>` : ''}
        <td>${esc(planName(p.planoId))}</td><td>${brl(p.valor)}</td><td>${badge(PAY_BADGE, p.status)}</td><td class="mono">${esc(p.paymentId ?? p.providerId)}</td></tr>`,
      )
      .join('')}</tbody></table></div>`;
}

async function renderPayments() {
  const state = { page: 1, status: '' };
  content.innerHTML = `<div class="card"><div class="filters"><select id="f-status"><option value="">Todos</option><option value="approved">Aprovados</option><option value="rejected">Recusados</option><option value="recycling">Em retentativa</option></select></div><div id="table"></div><div id="pager"></div></div>`;
  async function load() {
    const data = await api('/payments', { query: state });
    $('#table').innerHTML = paymentsTable(data.items);
    $('#pager').replaceChildren(pager(data, (p) => ((state.page = p), load())));
  }
  $('#f-status').addEventListener('change', (e) => ((state.status = e.target.value), (state.page = 1), load()));
  await load();
}

// ---------- planos e cobrança

async function renderPlans() {
  const [{ plans, limites }, billing] = await Promise.all([api('/plans'), api('/settings/billing')]);
  const LIMIT_LABELS = { clientes: 'Clientes', orcamentos: 'Orçamentos ativos', obras: 'Obras ativas', produtos: 'Itens no catálogo' };
  content.innerHTML = `
    <div class="card"><h3>Onde a assinatura aparece</h3>
      <p class="muted">A Google Play exige o faturamento dela para vender assinaturas dentro de apps Android (no Brasil, pagamento alternativo só com adesão ao programa de faturamento alternativo da Google). Por isso o checkout do Mercado Pago no Android começa <strong>desligado</strong>; a assinatura fica disponível na página web <a href="/assinar" target="_blank" rel="noopener">/assinar</a>.</p>
      <form id="billing-form" class="grid">
        <label class="check"><input type="checkbox" name="checkoutWeb" ${billing.checkoutWeb ? 'checked' : ''}>Web (página /assinar e versão web do app)</label>
        <label class="check"><input type="checkbox" name="checkoutAndroid" ${billing.checkoutAndroid ? 'checked' : ''}>App Android — ligar só se estiver de acordo com as regras da Google Play</label>
        <label class="check"><input type="checkbox" name="checkoutIos" ${billing.checkoutIos ? 'checked' : ''}>App iOS — ligar só se estiver de acordo com as regras da App Store</label>
        <label style="max-width:320px">Dias de tolerância após cobrança recusada<input type="number" min="0" max="30" name="diasTolerancia" value="${esc(billing.diasTolerancia)}"></label>
        <div class="actions"><button class="btn primary">Salvar</button></div>
      </form>
    </div>
    <div class="grid plans" id="plan-cards"></div>
    <p class="muted">Limite vazio = ilimitado. Mudanças de preço valem para novas assinaturas; quem já assina continua com o valor contratado.</p>`;

  $('#billing-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api('/settings/billing', {
        method: 'PUT',
        body: { checkoutWeb: f.checkoutWeb.checked, checkoutAndroid: f.checkoutAndroid.checked, checkoutIos: f.checkoutIos.checked, diasTolerancia: Number(f.diasTolerancia.value) },
      });
      toast('Configuração salva.');
    } catch (err) {
      toast(err.message, true);
    }
  });

  $('#plan-cards').innerHTML = plans
    .map(
      (p) => `<form class="card grid" data-plan="${esc(p.id)}">
        <div class="card-head"><h3>${esc(p.nome)}</h3>${p.destaque ? '<span class="badge accent">destaque</span>' : ''}</div>
        <label>Nome<input name="nome" value="${esc(p.nome)}"></label>
        <label>Preço mensal (R$)<input name="preco" type="number" step="0.01" min="0" value="${esc(p.preco)}" ${p.id === 'gratuito' ? 'disabled' : ''}></label>
        <label>Descrição<input name="descricao" value="${esc(p.descricao)}"></label>
        ${limites.map((k) => `<label>${esc(LIMIT_LABELS[k] ?? k)}<input name="lim_${k}" type="number" min="0" placeholder="Ilimitado" value="${p.limites[k] ?? ''}"></label>`).join('')}
        <label class="check"><input type="checkbox" name="destaque" ${p.destaque ? 'checked' : ''}>Destacar no app</label>
        ${p.id === 'gratuito' ? '' : `<label class="check"><input type="checkbox" name="disponivel" ${p.disponivel !== false ? 'checked' : ''}>Disponível para novas assinaturas</label>`}
        <button class="btn primary">Salvar ${esc(p.nome)}</button>
      </form>`,
    )
    .join('');

  document.querySelectorAll('form[data-plan]').forEach((form) =>
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form.dataset.plan;
      const body = { nome: form.nome.value, descricao: form.descricao.value, destaque: form.destaque.checked, limites: {} };
      if (id !== 'gratuito') {
        body.preco = Number(form.preco.value);
        body.disponivel = form.disponivel.checked;
      }
      for (const k of limites) {
        const v = form[`lim_${k}`].value;
        body.limites[k] = v === '' ? null : Number(v);
      }
      try {
        await api(`/plans/${id}`, { method: 'PUT', body });
        toast('Plano salvo.');
      } catch (err) {
        toast(err.message, true);
      }
    }),
  );
}

// ---------- integrações

async function renderIntegrations() {
  const d = await api('/integrations');
  const yes = (v) => (v ? '<span class="badge ok">Configurado</span>' : '<span class="badge bad">Não configurado</span>');
  const EVENTS = { novo_usuario: 'Novo cadastro', assinatura_ativada: 'Assinatura ativada', pagamento_recusado: 'Cobrança recusada', assinatura_cancelada: 'Assinatura cancelada', erro_webhook: 'Erros de webhook' };
  content.innerHTML = `
    <div class="grid half">
      <div class="card"><div class="card-head"><h3>Mercado Pago</h3>${yes(d.mercadopago.configurado)}</div>
        <dl class="kv">
          <dt>Modo</dt><dd>${d.mercadopago.modo ? `<span class="badge ${d.mercadopago.modo === 'producao' ? 'ok' : 'warn'}">${d.mercadopago.modo === 'producao' ? 'Produção' : 'Teste'}</span>` : '—'}</dd>
          <dt>Assinatura do webhook</dt><dd>${yes(d.mercadopago.webhookSecretConfigurado)}</dd>
          <dt>URL do webhook</dt><dd class="mono">${esc(d.mercadopago.webhookUrl)}</dd>
          <dt>URL de retorno</dt><dd class="mono">${esc(d.mercadopago.retornoUrl)}</dd>
        </dl>
        <p class="muted">Credenciais ficam nas variáveis MP_ACCESS_TOKEN e MP_WEBHOOK_SECRET do Render. No Mercado Pago, cadastre a URL acima em Suas integrações → Webhooks com os eventos "Planos e assinaturas" e "Pagamentos".</p>
        <div class="actions"><button class="btn" id="t-mp" ${d.mercadopago.configurado ? '' : 'disabled'}>Testar credencial</button></div>
      </div>
      <div class="card"><div class="card-head"><h3>E-mail (Brevo)</h3>${yes(d.email.configurado)}</div>
        <dl class="kv"><dt>Remetente</dt><dd>${d.email.remetente ? `${esc(d.email.nome)} &lt;${esc(d.email.remetente)}&gt;` : 'não definido'}</dd></dl>
        <p class="muted">Variáveis BREVO_API_KEY e MAIL_FROM_EMAIL no Render. O remetente precisa estar verificado no Brevo.</p>
        <form id="mail-test" class="actions"><input type="email" name="para" placeholder="enviar teste para…" required style="max-width:260px"><button class="btn" ${d.email.configurado ? '' : 'disabled'}>Enviar teste</button></form>
      </div>
    </div>
    <div class="card"><div class="card-head"><h3>Telegram</h3>${d.telegram.enabled ? '<span class="badge ok">Ativo</span>' : '<span class="badge">Desativado</span>'}</div>
      <p class="muted">Notificações para a equipe. Crie um bot com o @BotFather, adicione-o ao grupo e informe o token e o Chat ID. O token fica criptografado no banco e nunca é exibido.</p>
      <form id="tg-form" class="grid">
        <div class="form-grid">
          <label>Token do bot<input name="botToken" autocomplete="off" placeholder="${d.telegram.token ? 'Atual: ' + esc(d.telegram.token) + ' (deixe vazio para manter)' : '123456:ABC…'}"></label>
          <label>Chat ID<input name="chatId" value="${esc(d.telegram.chatId ?? '')}" placeholder="-100123456789"></label>
        </div>
        <div class="grid">${Object.entries(EVENTS).map(([k, l]) => `<label class="check"><input type="checkbox" name="ev" value="${k}" ${(d.telegram.eventos ?? []).includes(k) ? 'checked' : ''}>${esc(l)}</label>`).join('')}</div>
        <label class="check"><input type="checkbox" name="enabled" ${d.telegram.enabled ? 'checked' : ''}>Ativar notificações</label>
        <div class="actions"><button class="btn primary">Salvar</button><button type="button" class="btn" id="t-tg">Enviar mensagem de teste</button>${d.telegram.token ? '<button type="button" class="btn danger" id="tg-clear">Remover token</button>' : ''}</div>
      </form>
    </div>`;

  $('#t-mp').addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      const r = await api('/integrations/mercadopago/test', { method: 'POST' });
      toast(`Conectado: ${r.conta.apelido} (${r.modo})`);
    } catch (err) {
      toast(err.message, true);
    } finally {
      e.target.disabled = false;
    }
  });
  $('#mail-test').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/integrations/email/test', { method: 'POST', body: formData(e.target) });
      toast('E-mail de teste enviado.');
    } catch (err) {
      toast(err.message, true);
    }
  });
  $('#tg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const body = { enabled: f.enabled.checked, chatId: f.chatId.value.trim(), eventos: [...f.querySelectorAll('input[name=ev]:checked')].map((i) => i.value) };
    if (f.botToken.value.trim()) body.botToken = f.botToken.value.trim();
    try {
      await api('/integrations/telegram', { method: 'PUT', body });
      toast('Telegram salvo.');
      renderIntegrations();
    } catch (err) {
      toast(err.message, true);
    }
  });
  $('#t-tg').addEventListener('click', async () => {
    try {
      await api('/integrations/telegram/test', { method: 'POST' });
      toast('Mensagem enviada.');
    } catch (err) {
      toast(err.message, true);
    }
  });
  $('#tg-clear')?.addEventListener('click', () => confirmAction('Remover token', 'As notificações do Telegram param até um novo token ser salvo.', async () => {
    await api('/integrations/telegram', { method: 'PUT', body: { botToken: '', enabled: false } });
    toast('Token removido.');
    renderIntegrations();
  }, { danger: true }));
}

// ---------- diagnóstico

async function renderDiagnostics() {
  const d = await api('/diagnostics');
  const flag = (v) => (v ? '<span class="badge ok">definida</span>' : '<span class="badge bad">ausente</span>');
  const flagOpt = (v) => (v ? '<span class="badge ok">definida</span>' : '<span class="badge">não definida</span>');
  const r = d.rotinas.reconciliacao;
  content.innerHTML = `
    ${d.avisos.map((a) => `<div class="alert">${esc(a)}</div>`).join('')}
    <div class="grid kpis">
      ${kpi('Banco de dados', d.banco.ok ? 'OK' : 'Falha', `${d.banco.pingMs} ms de resposta`)}
      ${kpi('No ar há', formatUptime(d.servidor.uptimeSeg), `Node ${d.servidor.node}`)}
      ${kpi('Memória', `${d.servidor.memoriaMb} MB`, d.servidor.ambiente)}
      ${kpi('Webhooks (24 h)', num(d.webhooks.ultimas24h), `${num(d.webhooks.falhas24h)} com falha`)}
    </div>
    <div class="grid half">
      <div class="card"><h3>Variáveis de ambiente (Render)</h3>
        <p class="muted">Só mostra se cada variável existe — os valores nunca saem do servidor.</p>
        ${Object.entries(d.variaveis.obrigatorias).map(([k, v]) => `<div class="status-row"><span class="mono">${esc(k)}</span>${flag(v)}</div>`).join('')}
        ${Object.entries(d.variaveis.opcionais).map(([k, v]) => `<div class="status-row"><span class="mono">${esc(k)}</span>${flagOpt(v)}</div>`).join('')}
      </div>
      <div class="card"><h3>Banco de dados</h3>
        ${Object.entries(d.banco.colecoes).map(([k, v]) => `<div class="status-row"><span>${esc(k)}</span><strong>${num(v)}</strong></div>`).join('')}
        <h3 style="margin-top:18px">Rotina de reconciliação</h3>
        <dl class="kv"><dt>Intervalo</dt><dd>a cada ${r.intervaloHoras} h</dd><dt>Última execução</dt><dd>${dateTime(r.ultimaExecucao)}</dd>
        <dt>Resultado</dt><dd class="mono">${esc(r.erro ?? (r.resultado ? JSON.stringify(r.resultado) : '—'))}</dd></dl>
        <dl class="kv" style="margin-top:12px"><dt>URL pública</dt><dd class="mono">${esc(d.servidor.urlPublica)}</dd><dt>Último webhook</dt><dd>${dateTime(d.webhooks.ultimo)}</dd></dl>
      </div>
    </div>`;
}

function formatUptime(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}min` : `${m} min`;
}

// ---------- auditoria e webhooks

function auditTable(items) {
  if (!items.length) return '<p class="empty">Sem registros.</p>';
  return `<div class="table-wrap"><table><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Alvo</th><th>Detalhes</th></tr></thead><tbody>
    ${items
      .map(
        (e) => `<tr><td>${dateTime(e.createdAt)}</td><td>${esc(e.ator?.nome ?? e.ator?.tipo)}<div class="muted">${esc(e.ator?.tipo)}</div></td>
        <td class="mono">${esc(e.acao)}</td><td class="mono">${esc(e.alvo?.tipo ?? '')} ${esc(e.alvo?.id ?? '')}</td>
        <td class="mono">${e.detalhes ? esc(JSON.stringify(e.detalhes)).slice(0, 240) : ''}${e.ip ? `<div class="muted">IP ${esc(e.ip)}</div>` : ''}</td></tr>`,
      )
      .join('')}</tbody></table></div>`;
}

async function renderAudit() {
  const state = { page: 1, acao: '', q: '', de: '', ate: '' };
  content.innerHTML = `<div class="card"><div class="filters">
    <select id="f-acao"><option value="">Todas as ações</option><option value="admin">Painel (admin.*)</option><option value="usuario">Usuários (usuario.*)</option><option value="assinatura">Assinaturas (assinatura.*)</option><option value="plano">Planos</option><option value="integracao">Integrações</option><option value="configuracao">Configurações</option><option value="auditoria">Auditoria</option></select>
    <input id="f-q" type="search" placeholder="Filtrar por ator ou ID do alvo">
    <label class="inline">De<input id="f-de" type="date"></label>
    <label class="inline">Até<input id="f-ate" type="date"></label>
    <button class="btn" id="export-pdf">Exportar PDF</button></div>
    <div id="table"></div><div id="pager"></div></div>`;
  async function load() {
    const data = await api('/audit', { query: state });
    $('#table').innerHTML = auditTable(data.items);
    $('#pager').replaceChildren(pager(data, (p) => ((state.page = p), load())));
  }
  $('#f-acao').addEventListener('change', (e) => ((state.acao = e.target.value), (state.page = 1), load()));
  $('#f-de').addEventListener('change', (e) => ((state.de = e.target.value), (state.page = 1), load()));
  $('#f-ate').addEventListener('change', (e) => ((state.ate = e.target.value), (state.page = 1), load()));
  let timer;
  $('#f-q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => ((state.q = e.target.value), (state.page = 1), load()), 300);
  });
  $('#export-pdf').addEventListener('click', async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Gerando PDF…';
    try {
      await downloadFile('/audit/export.pdf', { acao: state.acao, q: state.q, de: state.de, ate: state.ate });
      toast('PDF da auditoria baixado.');
    } catch (err) {
      toast(err.message, true);
    } finally {
      e.target.disabled = false;
      e.target.textContent = 'Exportar PDF';
    }
  });
  await load();
}

/** Baixa um arquivo da API do painel (com o cabeçalho de proteção). */
async function downloadFile(path, query) {
  const url = new URL(`/admin/api${path}`, location.origin);
  for (const [k, v] of Object.entries(query ?? {})) if (v) url.searchParams.set(k, v);
  const res = await fetch(url, { credentials: 'same-origin', headers: { 'X-Admin-Request': '1' } });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (res.status === 401) showView('login');
    throw new ApiError(res.status, data);
  }
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? 'auditoria.pdf';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function renderWebhooks() {
  const state = { page: 1, status: '' };
  content.innerHTML = `<div class="card"><div class="filters"><select id="f-status"><option value="">Todos</option><option value="processado">Processados</option><option value="erro">Com erro</option><option value="rejeitado">Assinatura inválida</option><option value="ignorado">Ignorados</option></select></div>
    <div id="table"></div><div id="pager"></div></div>`;
  async function load() {
    const data = await api('/webhooks', { query: state });
    $('#table').innerHTML = data.items.length
      ? `<div class="table-wrap"><table><thead><tr><th>Recebido</th><th>Tipo</th><th>ID</th><th>Situação</th><th>Erro</th></tr></thead><tbody>
        ${data.items.map((w) => `<tr><td>${dateTime(w.createdAt)}</td><td class="mono">${esc(w.tipo)}</td><td class="mono">${esc(w.dataId)}</td><td>${badge(HOOK_BADGE, w.status)}</td><td class="muted">${esc(w.erro ?? '')}</td></tr>`).join('')}
        </tbody></table></div>`
      : '<p class="empty">Nenhuma notificação recebida.</p>';
    $('#pager').replaceChildren(pager(data, (p) => ((state.page = p), load())));
  }
  $('#f-status').addEventListener('change', (e) => ((state.status = e.target.value), (state.page = 1), load()));
  await load();
}

// ---------- conta

async function renderAccount() {
  const me = await api('/me');
  content.innerHTML = `<div class="card" style="max-width:520px"><h3>Trocar senha</h3>
    <p class="muted">Usuário: <strong>${esc(me.username)}</strong> · último acesso ${dateTime(me.lastLoginAt)}</p>
    <form id="acc-form" class="grid">
      <label>Senha atual<input type="password" name="senhaAtual" autocomplete="current-password" required></label>
      <label>Nova senha (10+ caracteres, letras e números)<input type="password" name="novaSenha" minlength="10" autocomplete="new-password" required></label>
      <label>Confirmar nova senha<input type="password" name="confirmar" minlength="10" autocomplete="new-password" required></label>
      <div class="actions"><button class="btn primary">Salvar nova senha</button></div>
    </form></div>`;
  $('#acc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = formData(e.target);
    if (f.novaSenha !== f.confirmar) return toast('A confirmação não confere.', true);
    try {
      await api('/change-password', { method: 'POST', body: { senhaAtual: f.senhaAtual, novaSenha: f.novaSenha } });
      e.target.reset();
      toast('Senha alterada.');
    } catch (err) {
      toast(err.message, true);
    }
  });
}

// ------------------------------------------------------------------ inicialização

async function boot() {
  try {
    const me = await api('/me');
    $('#who').textContent = me.username;
    if (me.mustChangePassword) return showView('password');
    showView('app');
    route();
  } catch {
    /* api() já mostrou a tela certa */
  }
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  $('#login-error').textContent = '';
  try {
    const r = await api('/login', { method: 'POST', body: formData(e.target) });
    e.target.senha.value = '';
    $('#who').textContent = r.username;
    if (r.mustChangePassword) showView('password');
    else {
      showView('app');
      route();
    }
  } catch (err) {
    $('#login-error').textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

$('#password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = formData(e.target);
  $('#password-error').textContent = '';
  if (f.novaSenha !== f.confirmar) return ($('#password-error').textContent = 'A confirmação não confere com a nova senha.');
  try {
    await api('/change-password', { method: 'POST', body: { senhaAtual: f.senhaAtual, novaSenha: f.novaSenha } });
    e.target.reset();
    toast('Senha definida.');
    showView('app');
    route();
  } catch (err) {
    $('#password-error').textContent = err.message;
  }
});

$('#logout').addEventListener('click', async () => {
  await api('/logout', { method: 'POST' }).catch(() => {});
  showView('login');
});
$('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
window.addEventListener('hashchange', () => {
  if (!$('#view-app').hidden) route();
});

boot();
