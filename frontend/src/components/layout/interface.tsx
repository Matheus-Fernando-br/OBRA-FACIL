// ==============================
// USER
// ==============================

export interface Usuario {
    _id: string;
    nome: string;
    email: string;
  
    CPF?: string;
    CNPJ?: string;
  }
  
  // ==============================
  // CLIENTE
  // ==============================
  
  export interface Cliente {
    _id: string;
  
    nome: string;
    email: string;
    telefone: string;
  
    CPF?: string;
    CNPJ?: string;

  }
  
  // ==============================
  // ENDEREÇO
  // ==============================
  
  export interface Endereco {
    CEP: string;
  
    estado: string;
    cidade: string;
  
    bairro: string;
  
    rua: string;
    numero: string;
  
    complemento: string;
  }
  
  // ==============================
  // SERVIÇO
  // ==============================
  
  export interface Servico {
    id: number; // apenas frontend

    nome: string;
  
    descricao: string;
  
    unidade: string;
  
    quantidade_unidade: number;
  
    preco_da_unidade: number;
  
    preco_total: number;
  }
  
  // ==============================
  // CATEGORIA
  // ==============================
  
  export interface Categoria {
    id: number; // apenas frontend

    nome: string;
  
    preco_total_da_categoria: number;
  
    servicos: Servico[];
  }
  
  // ==============================
  // ORÇAMENTO
  // ==============================
  
  export interface Orcamento {
    _id: string;
  
    nome: string;
  
    endereco: Endereco;
  
    descricao: string;
  
    cliente: Cliente;
  
    categoria: Categoria[];

    responsavel: string;
  
    status:
      | "PENDENTE"
      | "APROVADO"
      | "RECUSADO"
      | "CANCELADO";
  
    preco: number;
  
    bdi: number;
  
    preco_com_bdi: number;
  
    data_publicacao: Date;
  
    valido_durante: number;

    data_validade: Date;
  
  }