import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Códigos de 6 dígitos (verificação de e-mail e redefinição de senha). */
const VerificationCodeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
    tipo: { type: String, enum: ['verificacao_email', 'redefinir_senha'], required: true },
    codigoHash: { type: String, required: true },
    tentativas: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'codigos_verificacao', versionKey: false },
);

VerificationCodeSchema.index({ userId: 1, tipo: 1 });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.codigos_verificacao ||
  mongoose.model('codigos_verificacao', VerificationCodeSchema);
