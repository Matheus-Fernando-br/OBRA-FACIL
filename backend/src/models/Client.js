import mongoose from 'mongoose';

const { Schema } = mongoose;

const ClientSchema = new Schema(
  {
    /** Dono do registro. Todas as consultas filtram por ele. */
    responsavel: { type: Schema.Types.ObjectId, ref: 'usuarios', index: true },
    nome: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, maxlength: 254 },
    tipo: { type: String, enum: ['FISICO', 'JURIDICO'] },
    descricao: { type: String, trim: true, maxlength: 2000 },
    telefone: { type: String, trim: true, maxlength: 30 },
    CPF: { type: String, trim: true },
    CNPJ: { type: String, trim: true },
    imagem_perfil: { type: String, trim: true },
  },
  { timestamps: true, collection: 'clientes', versionKey: false },
);

export default mongoose.models.clientes || mongoose.model('clientes', ClientSchema);
