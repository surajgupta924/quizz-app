import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['google', 'legacy'], default: 'google' },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  mobile: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'student'], default: 'student', index: true },
  avatar: String, college: String, course: String, year: String,
  isVerified: { type: Boolean, default: false },
  lastLoginAt: Date,
}, { timestamps: true, toJSON: { transform: (_, value) => { delete value.password; return value; } } });
userSchema.index({ name: 'text', email: 'text', mobile: 'text' });

export default mongoose.model('User', userSchema);
