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

export interface AddCliente {
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

  cliente: Cliente | string;

  categoria: Categoria[];

  responsavel: string;

  status: "PENDENTE" | "APROVADO" | "RECUSADO" | "CANCELADO";

  preco: number;

  bdi: number;

  preco_com_bdi: number;

  data_publicacao: Date;

  valido_durante: number;

  data_validade: Date;
}

// ==============================
// SERVIÇO DA OBRA
// ==============================

export interface ServicoObra {
  nome: string;

  descricao?: string;

  qt_dias_prevista?: number;

  qt_dias_real?: number;

  porcentagem_de_conclusao?: number;
}

// ==============================
// CATEGORIA DA OBRA
// ==============================

export interface CategoriaObra {
  nome: string;

  servicos: ServicoObra[];

  qt_dias_prevista?: number;

  qt_dias_real?: number;

  porcentagem_de_conclusao?: number;
}

// ==============================
// OBRA
// ==============================

export interface Obra {
  _id: string;

  orcamento: string | Orcamento;

  responsavel: string | Usuario;

  categoria: CategoriaObra[];

  status: "NOPRAZO" | "ATRASADO" | "ADIANTADO" | "ENTREGUE" | "CANCELADO";

  data_inicio_prevista: Date;

  data_fim_prevista: Date;

  data_inicio_real?: Date;

  data_fim_real?: Date;

  qt_dias_prevista?: number;

  qt_dias_real?: number;

  porcentagem_de_conclusao?: number;
}
