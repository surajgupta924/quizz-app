import mongoose from 'mongoose';
const otpSchema = new mongoose.Schema({
  target: { type: String, required: true, index: true },
  purpose: { type: String, required: true },
  channel: { type: String, enum: ['email'], default: 'email', required: true },
  codeHash: { type: String, required: true, select: false },
  attempts: { type: Number, default: 0 }, consumedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });
otpSchema.index({ target: 1, purpose: 1 });
export default mongoose.model('OTP', otpSchema);
