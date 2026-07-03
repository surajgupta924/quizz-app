import mongoose from 'mongoose';
const answerSchema = new mongoose.Schema({ question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, selected: String, correct: Boolean, marksAwarded: Number }, { _id: false });
const resultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  answers: [answerSchema], score: { type: Number, default: 0 }, correct: Number, wrong: Number, skipped: Number,
  percentage: Number, passed: Boolean, rank: Number, timeTaken: Number,
  startedAt: Date, submittedAt: Date, submitReason: { type: String, enum: ['manual', 'timeout', 'violation', 'disconnect', 'recovery'], default: 'manual' },
  warnings: { type: Number, default: 0 }, questionOrder: [mongoose.Schema.Types.ObjectId], optionOrders: { type: Map, of: [String] },
}, { timestamps: true });
resultSchema.index({ exam: 1, student: 1 }, { unique: true });
export default mongoose.model('Result', resultSchema);
