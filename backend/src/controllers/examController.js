import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const pagination = req => ({ page: Math.max(Number(req.query.page) || 1, 1), limit: Math.min(Number(req.query.limit) || 10, 100) });
export const listExams = asyncHandler(async (req, res) => {
  const { page, limit } = pagination(req); const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.user.role === 'student') filter.status = { $in: ['scheduled', 'published', 'closed'] };
  const [items, total] = await Promise.all([Exam.find(filter).sort(req.query.sort || '-createdAt').skip((page - 1) * limit).limit(limit), Exam.countDocuments(filter)]);
  res.json({ success: true, items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
export const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne(req.params.code?.length === 10 ? { code: req.params.code } : { _id: req.params.id });
  if (!exam) throw new ApiError(404, 'Exam not found'); res.json({ success: true, exam });
});
const withCalculatedEnd = body => {
  const startAt = new Date(body.startAt);
  return { ...body, endAt: new Date(startAt.getTime() + Number(body.duration) * 60000) };
};
export const createExam = asyncHandler(async (req, res) => { const exam = await Exam.create({ ...withCalculatedEnd(req.body), createdBy: req.user._id }); res.status(201).json({ success: true, exam }); });
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, withCalculatedEnd(req.body), { new: true, runValidators: true });
  if (!exam) throw new ApiError(404, 'Exam not found'); res.json({ success: true, exam });
});
export const deleteExam = asyncHandler(async (req, res) => {
  if (await Result.exists({ exam: req.params.id })) throw new ApiError(409, 'An exam with submissions cannot be deleted');
  await Promise.all([Exam.findByIdAndDelete(req.params.id), Question.deleteMany({ exam: req.params.id })]); res.json({ success: true, message: 'Exam deleted' });
});
export const deployExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id); if (!exam) throw new ApiError(404, 'Exam not found');
  const questions = await Question.find({ exam: exam._id }).select('marks');
  if (!questions.length) throw new ApiError(422, 'Add at least one question before deployment');
  if (exam.endAt <= exam.startAt) throw new ApiError(422, 'End time must be after the start time');
  const availableMarks = questions.reduce((sum, question) => sum + question.marks, 0);
  if (exam.passingMarks > availableMarks) throw new ApiError(422, `Passing marks cannot exceed the ${availableMarks} marks available in questions`);
  exam.status = 'published'; exam.questionCount = questions.length; exam.totalMarks = availableMarks; await exam.save();
  res.json({ success: true, exam, link: `${process.env.CLIENT_URL}/exam/${exam.code}` });
});
export const closeExam = asyncHandler(async (req, res) => { const exam = await Exam.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true }); res.json({ success: true, exam }); });
