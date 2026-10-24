import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Configurações editáveis pelo painel (segredos ficam criptografados). */
const SettingSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    updatedBy: { type: String },
  },
  { timestamps: true, collection: 'configuracoes', versionKey: false, minimize: false },
);

SettingSchema.index({ key: 1 }, { unique: true });

export default mongoose.models.configuracoes || mongoose.model('configuracoes', SettingSchema);
