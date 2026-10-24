import mongoose from 'mongoose';

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
  },
  { timestamps: true, collection: 'orcamentos', versionKey: false },
);

OrcamentoSchema.index({ responsavel: 1, arquivado: 1 });
OrcamentoSchema.index({ responsavel: 1, cliente: 1 });

export default mongoose.models.orcamentos || mongoose.model('orcamentos', OrcamentoSchema);
