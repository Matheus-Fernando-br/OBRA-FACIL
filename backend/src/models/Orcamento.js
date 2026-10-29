import mongoose from 'mongoose';
import { calcularOrcamento } from '../utils/budgetCalc.js';

const { Schema } = mongoose;

const ServicoSchema = new Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  unidade: { type: String, required: true },
  quantidade_unidade: { type: Number, required: true },
  preco_da_unidade: { type: Number, required: true },
  preco_total: { type: Number },
});

const CategoriaSchema = new Schema({
  nome: { type: String, required: true },
  servicos: [ServicoSchema],
  preco_total_da_categoria: { type: Number },
});

const EnderecoSchema = new Schema(
  {
    CEP: { type: String },
    estado: { type: String },
    cidade: { type: String },
    bairro: { type: String },
    rua: { type: String },
    numero: { type: String },
    complemento: { type: String },
  },
  { _id: true },
);

const OrcamentoSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    endereco: EnderecoSchema,
    descricao: { type: String, trim: true },
    cliente: { type: Schema.Types.ObjectId, ref: 'clientes', required: true },
    responsavel: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
    categoria: [CategoriaSchema],
    status: {
      type: String,
      enum: ['PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO'],
      default: 'PENDENTE',
    },
    preco: { type: Number },
    bdi: { type: Number },
    preco_com_bdi: { type: Number },
    data_publicacao: { type: Date, default: Date.now },
    valido_durante: { type: Number },
    data_validade: { type: Date },
    arquivado: { type: Boolean, default: false },
    aprovadoEm: { type: Date },
  },
  { timestamps: true, collection: 'orcamentos', versionKey: false },
);

/*
 * Os valores são sempre recalculados aqui a partir das quantidades e dos
 * valores unitários — o que o app envia como total é ignorado. Assim app,
 * site, servidor e PDF mostram sempre os mesmos números.
 */
OrcamentoSchema.pre('validate', function recalcularValores() {
  const calc = calcularOrcamento(this.categoria, this.bdi);
  this.categoria.forEach((cat, i) => {
    cat.servicos.forEach((serv, j) => {
      serv.preco_total = calc.etapas[i].servicos[j] / 100;
    });
    cat.preco_total_da_categoria = calc.etapas[i].etapaCents / 100;
  });
  this.preco = calc.subtotalCents / 100;
  this.preco_com_bdi = calc.totalCents / 100;
  if (!this.data_validade && this.valido_durante) {
    const base = this.data_publicacao ?? new Date();
    this.data_validade = new Date(base.getTime() + this.valido_durante * 86400000);
  }
});

OrcamentoSchema.index({ responsavel: 1, arquivado: 1 });
OrcamentoSchema.index({ responsavel: 1, cliente: 1 });

export default mongoose.models.orcamentos || mongoose.model('orcamentos', OrcamentoSchema);
