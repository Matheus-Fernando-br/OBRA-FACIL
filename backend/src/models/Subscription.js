import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Assinatura recorrente (Mercado Pago "preapproval").
 * O status só muda a partir de dados consultados na API do Mercado Pago —
 * nunca a partir do que o app ou o corpo do webhook informam.
 */
const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'usuarios', index: true },
    planoId: { type: String, required: true },
    /**
     * recorrente: cobrança automática todo mês no cartão de crédito (preapproval);
     * avulso: o cliente paga 1 mês por vez (Pix ou cartão) e o acesso vale até acessoAte.
     */
    modalidade: { type: String, enum: ['recorrente', 'avulso'], default: 'recorrente' },
    provider: { type: String, enum: ['mercadopago'], default: 'mercadopago' },
    providerId: { type: String },
    status: {
      type: String,
      enum: ['pendente', 'ativa', 'pausada', 'cancelada', 'expirada', 'suspeita'],
      default: 'pendente',
    },
    valor: { type: Number, required: true },
    moeda: { type: String, default: 'BRL' },
    initPoint: { type: String },
    payerEmail: { type: String },
    plataforma: { type: String },
    proximaCobrancaEm: { type: Date },
    /** Data até quando o acesso continua após cancelamento (período já pago). */
    acessoAte: { type: Date },
    ativadaEm: { type: Date },
    canceladaEm: { type: Date },
    canceladaPor: { type: String },
    inadimplenteDesde: { type: Date },
    ultimoPagamento: {
      id: String,
      status: String,
      valor: Number,
      data: Date,
    },
    providerStatus: { type: String },
    /** Aviso de vencimento já enviado (modalidade avulso). */
    lembreteEnviadoEm: { type: Date },
    sincronizadaEm: { type: Date },
    observacao: { type: String },
  },
  { timestamps: true, collection: 'assinaturas', versionKey: false },
);

SubscriptionSchema.index({ providerId: 1 }, { unique: true, sparse: true });
SubscriptionSchema.index({ status: 1 });

export default mongoose.models.assinaturas || mongoose.model('assinaturas', SubscriptionSchema);
