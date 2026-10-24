import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    senha: { type: String, required: true },
    CPF: { type: String, trim: true },
    CNPJ: { type: String, trim: true },
    imagem_perfil: { type: String, trim: true },

    email_verificado: { type: Boolean, default: false },
    /** Contas criadas antes da verificação obrigatória (migração 003). */
    verificacaoLegada: { type: Boolean },

    aceiteTermosEm: { type: Date },
    versaoTermos: { type: String },

    status: { type: String, enum: ['ativo', 'bloqueado'], default: 'ativo' },
    /** Incrementado para invalidar todas as sessões (troca de senha, bloqueio). */
    tokenVersion: { type: Number, default: 0 },
    ultimoLoginEm: { type: Date },

    /** Plano efetivo (cache). Fonte da verdade: assinatura ativa ou cortesia. */
    planoAtual: { type: String, default: 'gratuito' },
    /** Plano concedido manualmente pelo painel (cortesia, parceria, suporte). */
    planoManual: {
      planoId: { type: String },
      ate: { type: Date },
      motivo: { type: String },
      concedidoPor: { type: String },
      concedidoEm: { type: Date },
    },

    /** Legado do backend anterior (lista de clientes). Não é mais usado. */
    clientes: [{ type: Schema.Types.ObjectId, ref: 'clientes', select: false }],
    tipo: { type: Boolean, select: false },
  },
  { timestamps: true, collection: 'usuarios' },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ planoAtual: 1 });

UserSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.senha;
    delete ret.tokenVersion;
    delete ret.clientes;
    delete ret.tipo;
    return ret;
  },
});

export default mongoose.models.usuarios || mongoose.model('usuarios', UserSchema);
