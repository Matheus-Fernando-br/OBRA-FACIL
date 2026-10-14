/** Item exibido no painel de notificações (gerado em utils/alerts). */
export interface Notification {
  id: string;
  title: string;
  description: string;
  /** Agrupamento no painel: "Hoje" | "Ontem" | "Esta semana". */
  date: string;
  hour: string;
  route: string;
  read: boolean;
}
