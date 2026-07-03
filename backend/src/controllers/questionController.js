import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const listQuestions = asyncHandler(async (req, res) => res.json({ success: true, items: await Question.find({ exam: req.params.examId }).select('+correctAnswer').sort('createdAt') }));
export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({ ...req.body, exam: req.params.examId, createdBy: req.user._id, image: req.file?.path });
  await Exam.findByIdAndUpdate(req.params.examId, { $inc: { questionCount: 1 } }); res.status(201).json({ success: true, question });
});
export const updateQuestion = asyncHandler(async (req, res) => { const item = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('+correctAnswer'); if (!item) throw new ApiError(404, 'Question not found'); res.json({ success: true, question: item }); });
export const deleteQuestion = asyncHandler(async (req, res) => { const item = await Question.findByIdAndDelete(req.params.id); if (!item) throw new ApiError(404, 'Question not found'); await Exam.findByIdAndUpdate(item.exam, { $inc: { questionCount: -1 } }); res.json({ success: true, message: 'Question deleted' }); });
export const bulkQuestions = asyncHandler(async (req, res) => { const docs = req.body.questions.map(q => ({ ...q, exam: req.params.examId, createdBy: req.user._id })); const items = await Question.insertMany(docs); await Exam.findByIdAndUpdate(req.params.examId, { $inc: { questionCount: items.length } }); res.status(201).json({ success: true, count: items.length }); });
