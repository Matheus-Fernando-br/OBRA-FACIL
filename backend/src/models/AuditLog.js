import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Histórico de operações administrativas e eventos sensíveis. */
const AuditLogSchema = new Schema(
  {
    ator: {
      tipo: { type: String, enum: ['admin', 'usuario', 'sistema'], required: true },
      id: { type: String },
      nome: { type: String },
    },
    acao: { type: String, required: true },
    alvo: {
      tipo: { type: String },
      id: { type: String },
    },
    detalhes: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'auditoria', versionKey: false },
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ acao: 1, createdAt: -1 });

export default mongoose.models.auditoria || mongoose.model('auditoria', AuditLogSchema);
