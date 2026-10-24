import mongoose from 'mongoose';

const { Schema } = mongoose;

const AdminSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, lowercase: true },
    senhaHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastLoginAt: { type: Date },
    senhaAlteradaEm: { type: Date },
  },
  { timestamps: true, collection: 'admins', versionKey: false },
);

AdminSchema.index({ username: 1 }, { unique: true });

AdminSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.senhaHash;
    delete ret.tokenVersion;
    delete ret.failedAttempts;
    return ret;
  },
});

export default mongoose.models.admins || mongoose.model('admins', AdminSchema);
