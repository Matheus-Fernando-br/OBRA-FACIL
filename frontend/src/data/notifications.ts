export interface Notification {

    id: string;
  
    title: string;
  
    description: string;
  
    date: string;
  
    hour: string;
  
    route: string;
  
    read: boolean;
  
  }
  
  export const notificationsMock: Notification[] = [
  
    {
      id: "1",
      title: "Novo cliente cadastrado",
      description: "João da Silva foi adicionado ao sistema.",
      date: "Hoje",
      hour: "10:35",
      route: "/clientes",
      read: false,
    },
  
    {
      id: "2",
      title: "Orçamento aprovado",
      description: "O orçamento #001 foi aprovado.",
      date: "Hoje",
      hour: "09:10",
      route: "/orcamentos",
      read: false,
    },
  
    {
      id: "3",
      title: "Backup realizado",
      description: "Backup automático concluído com sucesso.",
      date: "Ontem",
      hour: "18:20",
      route: "/configuracoes",
      read: true,
    },
  
    {
      id: "4",
      title: "Nova obra criada",
      description: "Residencial Oliveira foi cadastrada.",
      date: "Esta semana",
      hour: "14:52",
      route: "/obras",
      read: false,
    },
  
  ];