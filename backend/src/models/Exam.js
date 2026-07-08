import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, description: String,
  subject: { type: String, required: true, trim: true }, duration: { type: Number, required: true, min: 1 },
  startAt: { type: Date, required: true }, endAt: { type: Date, required: true },
  passingMarks: { type: Number, required: true, min: 0 }, totalMarks: { type: Number, required: true, min: 1 },
  negativeMarking: { type: Boolean, default: false },
  resultTemplate: {
    type: String,
    enum: [
      'classic', 'celebration', 'minimal',
      'template-01', 'template-02', 'template-03', 'template-04', 'template-05',
      'template-06', 'template-07', 'template-08', 'template-09', 'template-10',
    ],
    default: 'template-01',
  },
  status: { type: String, enum: ['draft', 'scheduled', 'published', 'closed'], default: 'draft', index: true },
  code: { type: String, unique: true, default: () => nanoid(10), index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructions: [String], questionCount: { type: Number, default: 0 },
}, { timestamps: true });
examSchema.index({ title: 'text', subject: 'text' });
export default mongoose.model('Exam', examSchema);
