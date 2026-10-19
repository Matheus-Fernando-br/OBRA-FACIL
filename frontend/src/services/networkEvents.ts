/* Eventos de rede: a API avisa quando uma requisição falha por falta de
   conexão; o ConnectionBanner (layout raiz) mostra o aviso ao usuário. */

type Listener = () => void;
const listeners = new Set<Listener>();

export function onNetworkError(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitNetworkError() {
  listeners.forEach((listener) => listener());
}
