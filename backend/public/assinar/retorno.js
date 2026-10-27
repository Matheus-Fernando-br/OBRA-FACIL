/* Volta do Mercado Pago: consulta a assinatura até o pagamento ser confirmado. */
const $ = (s) => document.querySelector(s);
const TENTATIVAS = 12; // ~1 minuto
const INTERVALO_MS = 5000;

let token = null;
try {
  token = sessionStorage.getItem('of_assinar_token');
} catch {
  token = null;
}

function estado({ icone, titulo, texto, fim = false, ok = false }) {
  $('#titulo').textContent = titulo;
  $('#texto').textContent = texto;
  if (fim) {
    $('#spinner').hidden = true;
    $('#icone').hidden = false;
    $('#icone').textContent = icone;
    $('#icone').className = `icone ${ok ? 'ok' : 'aviso'}`;
  }
  if (ok) {
    $('#step-3').className = 'done';
    $('#abrir-app').hidden = false;
  }
}

// O Mercado Pago informa a situação na URL de retorno (quando disponível).
const params = new URLSearchParams(location.search);
const statusMp = params.get('status') || params.get('collection_status');

async function consultar(tentativa = 1) {
  if (!token) {
    estado({
      fim: true,
      icone: '✓',
      titulo: 'Recebemos seu pedido',
      texto: 'Assim que o Mercado Pago confirmar o pagamento, seu plano é atualizado no app automaticamente. Você também receberá um e-mail.',
    });
    return;
  }
  try {
    const res = await fetch('/subscription/sync', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'X-Platform': 'web' } });
    if (res.ok) {
      const data = await res.json();
      if (data.plano && data.plano.id !== 'gratuito') {
        estado({
          fim: true,
          ok: true,
          icone: '✓',
          titulo: `Plano ${data.plano.nome} ativo!`,
          texto: 'Pagamento confirmado. Abra o app Obra Fácil — os novos limites já estão valendo.',
        });
        return;
      }
    }
  } catch {
    /* tenta de novo */
  }
  if (tentativa < TENTATIVAS) {
    if (tentativa === 3) $('#texto').textContent = 'Ainda aguardando o Mercado Pago… Não feche esta página.';
    setTimeout(() => consultar(tentativa + 1), INTERVALO_MS);
    return;
  }
  estado({
    fim: true,
    icone: '⏳',
    titulo: 'Pagamento em processamento',
    texto:
      statusMp === 'rejected'
        ? 'O Mercado Pago recusou o pagamento. Volte para a página de assinatura e tente com outro cartão.'
        : 'O Mercado Pago ainda está processando. Pode fechar esta página: assim que for confirmado, o plano muda no app e você recebe um e-mail.',
  });
}

consultar();
