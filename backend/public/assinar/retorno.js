/* Volta do Mercado Pago: tenta sincronizar e mostrar o plano atualizado. */
let token = null;
try {
  token = sessionStorage.getItem('of_assinar_token');
} catch {
  token = null;
}

async function sync(tentativa = 1) {
  if (!token) return;
  try {
    const res = await fetch('/subscription/sync', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'X-Platform': 'web' } });
    if (!res.ok) return;
    const data = await res.json();
    if (data.plano && data.plano.id !== 'gratuito') {
      document.getElementById('titulo').textContent = `Plano ${data.plano.nome} ativo!`;
      document.getElementById('texto').textContent = 'Pronto! Abra o app Obra Fácil — os novos limites já estão valendo.';
      return;
    }
  } catch {
    /* tenta de novo */
  }
  if (tentativa < 6) setTimeout(() => sync(tentativa + 1), 5000);
}

sync();
