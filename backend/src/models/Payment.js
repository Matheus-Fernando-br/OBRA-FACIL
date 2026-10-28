import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Cobranças das assinaturas (para receita e histórico). */
const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'usuarios', index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'assinaturas', index: true },
    provider: { type: String, default: 'mercadopago' },
    /**
     * ID no Mercado Pago: cobrança recorrente (authorized_payment) ou
     * pagamento avulso (/v1/payments). Antes da resposta: "pendente:<_id>".
     */
    providerId: { type: String, required: true },
    modalidade: { type: String, enum: ['recorrente', 'avulso'], default: 'recorrente' },
    /** pix | credit_card | debit_card */
    metodo: { type: String },
    statusDetail: { type: String },
    /** Pagamento avulso já liberou o período (evita liberar duas vezes). */
    aplicadoEm: { type: Date },
    pix: {
      qrCode: String,
      qrCodeBase64: String,
      ticketUrl: String,
      expiraEm: Date,
    },
    paymentId: { type: String },
    planoId: { type: String },
    status: { type: String },
    valor: { type: Number },
    moeda: { type: String, default: 'BRL' },
    data: { type: Date },
  },
  { timestamps: true, collection: 'pagamentos', versionKey: false },
);

PaymentSchema.index({ provider: 1, providerId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, data: -1 });

export default mongoose.models.pagamentos || mongoose.model('pagamentos', PaymentSchema);
