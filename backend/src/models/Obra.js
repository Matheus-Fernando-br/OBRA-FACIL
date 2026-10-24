import mongoose from 'mongoose';

const { Schema } = mongoose;

const ServicoSchema = new Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  qt_dias_prevista: { type: Number },
  qt_dias_real: { type: Number },
  porcentagem_de_conclusao: { type: Number },
  concluido: { type: Boolean, default: false },
});

const CategoriaSchema = new Schema({
  nome: { type: String, required: true },
  servicos: [ServicoSchema],
  qt_dias_prevista: { type: Number },
  qt_dias_real: { type: Number },
  porcentagem_de_conclusao: { type: Number },
});

const ObraSchema = new Schema(
  {
    orcamento: { type: Schema.Types.ObjectId, ref: 'orcamentos', required: true },
    responsavel: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
    categoria: [CategoriaSchema],
    status: {
      type: String,
      enum: ['NOPRAZO', 'ATRASADO', 'ADIANTADO', 'ENTREGUE', 'CANCELADO'],
      default: 'NOPRAZO',
    },
    data_inicio_prevista: { type: Date, default: Date.now },
    data_fim_prevista: { type: Date, default: Date.now },
    data_inicio_real: { type: Date },
    data_fim_real: { type: Date },
    qt_dias_prevista: { type: Number },
    qt_dias_real: { type: Number },
    porcentagem_de_conclusao: { type: Number },
    arquivado: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'obras', versionKey: false },
);

ObraSchema.index({ responsavel: 1, arquivado: 1 });
ObraSchema.index({ responsavel: 1, orcamento: 1 });

export default mongoose.models.obras || mongoose.model('obras', ObraSchema);
