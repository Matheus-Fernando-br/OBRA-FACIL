import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Sessões. O token em si nunca é salvo — só o hash SHA-256.
 * Rotação: cada uso gera um token novo da mesma "família"; reutilizar um
 * token já trocado indica roubo e revoga a família inteira.
 */
const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true, index: true },
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedAt: { type: Date },
    userAgent: { type: String, maxlength: 200 },
  },
  { timestamps: true, collection: 'sessoes', versionKey: false },
);

RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.sessoes || mongoose.model('sessoes', RefreshTokenSchema);
