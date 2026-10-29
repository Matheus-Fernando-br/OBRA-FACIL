import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Notificação no painel do app (uma por usuário e comunicado). */
const NotificacaoSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
    comunicadoId: { type: Schema.Types.ObjectId, ref: 'comunicados' },
    titulo: { type: String, required: true, maxlength: 120 },
    mensagem: { type: String, required: true, maxlength: 2000 },
    lidaEm: { type: Date },
    removidaEm: { type: Date },
  },
  { timestamps: true, collection: 'notificacoes', versionKey: false },
);

NotificacaoSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.notificacoes || mongoose.model('notificacoes', NotificacaoSchema);
