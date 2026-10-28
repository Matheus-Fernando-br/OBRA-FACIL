import { z } from 'zod';
import { isValidCNPJ, isValidCPF, onlyDigits } from '../utils/documents.js';

/* Esquemas de entrada. Campos não listados são descartados. */

const text = (max, msg) => z.string({ error: msg }).trim().max(max, `${msg ?? 'Campo'} muito longo.`);
const optText = (max) =>
  z
    .string()
    .trim()
    .max(max, 'Texto muito longo.')
    .optional()
    .nullable()
    .transform((v) => v ?? undefined);

export const email = z
  .string({ error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .max(254, 'E-mail muito longo.')
  .pipe(z.email({ error: 'Informe um e-mail válido.' }));

export const senha = z
  .string({ error: 'Informe a senha.' })
  .min(6, 'A senha deve ter no mínimo 6 caracteres.')
  .max(128, 'A senha deve ter no máximo 128 caracteres.');

const codigo = z
  .string({ error: 'Informe o código.' })
  .trim()
  .regex(/^\d{6}$/, 'O código deve ter 6 dígitos.');

/** CPF/CNPJ: string vazia vira "não informado"; se informado, precisa ser válido. */
const cpf = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || isValidCPF(v), 'CPF inválido.');
const cnpj = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || isValidCNPJ(v), 'CNPJ inválido.');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Identificador inválido.');
const money = z.coerce.number({ error: 'Valor inválido.' }).finite('Valor inválido.').min(0, 'O valor não pode ser negativo.').max(1e10);
const optNumber = z.coerce.number().finite().min(0).max(1e10).optional().nullable().transform((v) => v ?? undefined);
const optDate = z.coerce.date({ error: 'Data inválida.' }).optional().nullable().transform((v) => v ?? undefined);

// ---------------------------------------------------------------- auth

export const registerSchema = z
  .object({
    nome: text(120, 'Informe seu nome.').min(2, 'Informe seu nome completo.'),
    email,
    senha,
    CPF: cpf,
    CNPJ: cnpj,
    aceiteTermos: z.literal(true, { error: 'É preciso aceitar os Termos de Uso e a Política de Privacidade.' }),
    versaoTermos: z.string().trim().max(40).optional(),
  })
  .refine((d) => d.CPF || d.CNPJ, { message: 'Informe seu CPF ou CNPJ.', path: ['CPF'] });

export const loginSchema = z.object({
  email,
  senha: z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.').max(128),
});

export const emailOnlySchema = z.object({ email });
export const verifyEmailSchema = z.object({ email, codigo });
export const resetPasswordSchema = z.object({ email, codigo, novaSenha: senha });
export const refreshSchema = z.object({ refreshToken: z.string().max(200).optional() });

// ---------------------------------------------------------------- usuário

export const updateUserSchema = z.object({
  nome: text(120, 'Informe seu nome.').min(2, 'Informe seu nome completo.').optional(),
  email: email.optional(),
  CPF: cpf,
  CNPJ: cnpj,
  imagem_perfil: optText(500),
  senha: senha.optional(),
  senhaAtual: z.string().max(128).optional(),
  preferencias: z.object({ tema: z.enum(['light', 'dark', 'system']).optional() }).optional(),
});

export const deleteUserSchema = z.object({
  senha: z.string({ error: 'Informe sua senha para confirmar.' }).min(1, 'Informe sua senha para confirmar.').max(128),
});

// ---------------------------------------------------------------- clientes

const clientBase = {
  nome: text(120, 'Informe o nome do cliente.').min(2, 'Informe o nome do cliente.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .optional()
    .nullable()
    .transform((v) => v || undefined)
    .refine((v) => v === undefined || z.email().safeParse(v).success, 'E-mail do cliente inválido.'),
  tipo: z.enum(['FISICO', 'JURIDICO']).optional(),
  descricao: optText(2000),
  telefone: optText(30).refine((v) => v === undefined || onlyDigits(v).length >= 8, 'Telefone inválido.'),
  CPF: cpf,
  CNPJ: cnpj,
  imagem_perfil: optText(500),
};

export const clientCreateSchema = z.object(clientBase);
export const clientUpdateSchema = z.object(clientBase).partial();

// ---------------------------------------------------------------- produtos

const produtoBase = {
  nome: text(120, 'Informe o nome do item.').min(1, 'Informe o nome do item.'),
  descricao: optText(1000),
  tipo: z.enum(['PRODUTO', 'SERVICO']).optional(),
  unidade: text(20, 'Informe a unidade.').min(1, 'Informe a unidade.'),
  preco_unidade: money,
  categoria: optText(60),
  ativo: z.boolean().optional(),
};

export const produtoCreateSchema = z.object(produtoBase);
export const produtoUpdateSchema = z.object(produtoBase).partial();

// ---------------------------------------------------------------- orçamentos

const endereco = z
  .object({
    CEP: optText(12),
    estado: optText(40),
    cidade: optText(80),
    bairro: optText(80),
    rua: optText(120),
    numero: optText(20),
    complemento: optText(120),
  })
  .optional()
  .nullable()
  .transform((v) => v ?? undefined);

const servicoOrcamento = z.object({
  nome: text(200, 'Informe o nome do serviço.').min(1, 'Informe o nome do serviço.'),
  descricao: optText(2000),
  unidade: text(20, 'Informe a unidade do serviço.').min(1, 'Informe a unidade do serviço.'),
  quantidade_unidade: money,
  preco_da_unidade: money,
  preco_total: optNumber,
});

const categoriaOrcamento = z.object({
  nome: text(200, 'Informe o nome da etapa.').min(1, 'Informe o nome da etapa.'),
  servicos: z.array(servicoOrcamento).max(500).default([]),
  preco_total_da_categoria: optNumber,
});

const orcamentoBase = {
  nome: text(200, 'Informe o nome do orçamento.').min(1, 'Informe o nome do orçamento.'),
  endereco,
  descricao: optText(5000),
  cliente: objectId,
  categoria: z.array(categoriaOrcamento).max(200).default([]),
  status: z.enum(['PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO']).optional(),
  preco: optNumber,
  bdi: z.coerce.number().finite().min(0).max(1000).optional().nullable().transform((v) => v ?? undefined),
  preco_com_bdi: optNumber,
  data_publicacao: optDate,
  valido_durante: z.coerce.number().int().min(0).max(3650).optional().nullable().transform((v) => v ?? undefined),
  data_validade: optDate,
  arquivado: z.boolean().optional(),
};

/** Aceita cliente como id ou objeto populado ({ _id }). */
const clienteRef = z.preprocess((v) => (v && typeof v === 'object' ? v._id : v), objectId);

export const orcamentoCreateSchema = z.object({ ...orcamentoBase, cliente: clienteRef });
export const orcamentoUpdateSchema = z
  .object({ ...orcamentoBase, cliente: clienteRef, categoria: z.array(categoriaOrcamento).max(200) })
  .partial();

// ---------------------------------------------------------------- obras

const servicoObra = z.object({
  nome: text(200, 'Informe o nome do serviço.').min(1, 'Informe o nome do serviço.'),
  descricao: optText(2000),
  qt_dias_prevista: optNumber,
  qt_dias_real: optNumber,
  porcentagem_de_conclusao: z.coerce.number().min(0).max(100).optional().nullable().transform((v) => v ?? undefined),
  concluido: z.boolean().optional(),
});

const categoriaObra = z.object({
  nome: text(200, 'Informe o nome da etapa.').min(1, 'Informe o nome da etapa.'),
  servicos: z.array(servicoObra).max(500).default([]),
  qt_dias_prevista: optNumber,
  qt_dias_real: optNumber,
  porcentagem_de_conclusao: z.coerce.number().min(0).max(100).optional().nullable().transform((v) => v ?? undefined),
});

const orcamentoRef = z.preprocess((v) => (v && typeof v === 'object' ? v._id : v), objectId);

const obraBase = {
  orcamento: orcamentoRef,
  categoria: z.array(categoriaObra).max(200).default([]),
  status: z.enum(['NOPRAZO', 'ATRASADO', 'ADIANTADO', 'ENTREGUE', 'CANCELADO']).optional(),
  data_inicio_prevista: optDate,
  data_fim_prevista: optDate,
  data_inicio_real: optDate,
  data_fim_real: optDate,
  qt_dias_prevista: optNumber,
  qt_dias_real: optNumber,
  porcentagem_de_conclusao: z.coerce.number().min(0).max(100).optional().nullable().transform((v) => v ?? undefined),
  arquivado: z.boolean().optional(),
};

export const obraCreateSchema = z.object(obraBase);
export const obraUpdateSchema = z.object({ ...obraBase, categoria: z.array(categoriaObra).max(200) }).partial();

// ---------------------------------------------------------------- assinatura

export const checkoutSchema = z.object({
  planoId: z.enum(['basico', 'profissional'], { error: 'Plano inválido.' }),
  /** E-mail da conta do Mercado Pago que vai pagar (opcional). */
  payerEmail: email.optional(),
  /** Token do cartão gerado pelo formulário seguro do Mercado Pago (cobrança automática). */
  cardTokenId: z.string().trim().min(8).max(200).optional(),
});

const shortText = (max) => z.string().trim().max(max).optional();

/** Pagamento de 1 mês. Só os campos abaixo passam; o valor é sempre o do plano no servidor. */
export const oneTimePaymentSchema = z.object({
  planoId: z.enum(['basico', 'profissional'], { error: 'Plano inválido.' }),
  formData: z.object({
    payment_method_id: z.string({ error: 'Escolha a forma de pagamento.' }).trim().min(2).max(40),
    payment_type_id: shortText(40),
    token: shortText(200),
    issuer_id: z.union([z.string().trim().max(40), z.number()]).optional(),
    payer: z
      .object({
        email: email.optional(),
        first_name: shortText(80),
        last_name: shortText(80),
        identification: z.object({ type: shortText(10), number: shortText(20) }).optional(),
      })
      .optional(),
  }),
});
