import mongoose from 'mongoose';
import { aplicarCronograma } from '../utils/workSchedule.js';

const { Schema } = mongoose;

const ServicoSchema = new Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  qt_dias_prevista: { type: Number },
  qt_dias_real: { type: Number },
  porcentagem_de_conclusao: { type: Number },
  concluido: { type: Boolean, default: false },
  /** Cronograma: dias contados a partir do início previsto da obra (dia 1). */
  dia_inicio: { type: Number },
  dia_fim: { type: Number },
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
    /** Nome da obra (editável). Sem nome, o app mostra o nome do orçamento. */
    nome: { type: String, trim: true, maxlength: 200 },
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

// Dias previstos e data de fim prevista sempre derivados do cronograma.
ObraSchema.pre('validate', function cronograma() {
  aplicarCronograma(this);
});

ObraSchema.index({ responsavel: 1, arquivado: 1 });
ObraSchema.index({ responsavel: 1, orcamento: 1 });

export default mongoose.models.obras || mongoose.model('obras', ObraSchema);
