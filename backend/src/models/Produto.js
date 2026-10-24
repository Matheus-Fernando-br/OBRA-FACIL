import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Catálogo de produtos e serviços do usuário (itens reutilizáveis nos
 * orçamentos: nome, unidade e preço padrão).
 */
const ProdutoSchema = new Schema(
  {
    responsavel: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
    nome: { type: String, required: true, trim: true, maxlength: 120 },
    descricao: { type: String, trim: true, maxlength: 1000 },
    tipo: { type: String, enum: ['PRODUTO', 'SERVICO'], default: 'SERVICO' },
    unidade: { type: String, required: true, trim: true, maxlength: 20 },
    preco_unidade: { type: Number, required: true, min: 0 },
    categoria: { type: String, trim: true, maxlength: 60 },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'produtos', versionKey: false },
);

ProdutoSchema.index({ responsavel: 1, nome: 1 });

export default mongoose.models.produtos || mongoose.model('produtos', ProdutoSchema);
