import mongoose from 'mongoose';
const optionSchema = new mongoose.Schema({ text: { type: String, required: true }, key: { type: String, required: true } }, { _id: false });
const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  type: { type: String, enum: ['mcq', 'true-false', 'single-correct'], default: 'mcq' },
  text: { type: String, required: true }, options: { type: [optionSchema], validate: value => value.length >= 2 },
  correctAnswer: { type: String, required: true, select: false }, marks: { type: Number, default: 1, min: 0 },
  negativeMarks: { type: Number, default: 0, min: 0 }, difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  image: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export default mongoose.model('Question', questionSchema);
