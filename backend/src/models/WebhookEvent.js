import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Notificações recebidas (auditoria e proteção contra duplicadas). */
const WebhookEventSchema = new Schema(
  {
    provider: { type: String, default: 'mercadopago' },
    dedupeKey: { type: String, required: true },
    tipo: { type: String },
    acao: { type: String },
    dataId: { type: String },
    requestId: { type: String },
    assinaturaValida: { type: Boolean },
    status: { type: String, enum: ['recebido', 'processado', 'ignorado', 'erro', 'rejeitado'] },
    erro: { type: String },
    processadoEm: { type: Date },
  },
  { timestamps: true, collection: 'webhook_eventos', versionKey: false },
);

WebhookEventSchema.index({ dedupeKey: 1 }, { unique: true });
WebhookEventSchema.index({ createdAt: -1 });
// Mantém 180 dias de histórico.
WebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180, name: 'ttl_180d' });

export default mongoose.models.webhook_eventos || mongoose.model('webhook_eventos', WebhookEventSchema);
