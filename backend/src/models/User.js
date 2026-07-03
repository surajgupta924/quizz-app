import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  mobile: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['admin', 'student'], default: 'student', index: true },
  avatar: String, college: String, course: String, year: String,
  isVerified: { type: Boolean, default: false },
  lastLoginAt: Date, passwordChangedAt: Date,
}, { timestamps: true, toJSON: { transform: (_, value) => { delete value.password; return value; } } });

userSchema.pre('save', async function next() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function compare(candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.index({ name: 'text', email: 'text', mobile: 'text' });

export default mongoose.model('User', userSchema);
