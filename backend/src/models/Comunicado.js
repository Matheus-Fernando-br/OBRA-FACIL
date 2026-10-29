import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Envio feito pelo painel admin (histórico e contagens). */
const ComunicadoSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 120 },
    mensagem: { type: String, required: true, trim: true, maxlength: 2000 },
    canais: { app: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
    publico: {
      tipo: { type: String, enum: ['todos', 'filtro', 'selecionados'], required: true },
      filtros: { plano: String, status: String, verificado: String },
      quantidadeSelecionados: Number,
    },
    destinatarios: { type: Number, default: 0 },
    emails: { enviados: { type: Number, default: 0 }, falhas: { type: Number, default: 0 }, emAndamento: { type: Boolean, default: false } },
    enviadoPor: { type: String },
  },
  { timestamps: true, collection: 'comunicados', versionKey: false },
);

export default mongoose.models.comunicados || mongoose.model('comunicados', ComunicadoSchema);
