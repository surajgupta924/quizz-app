import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const now = new Date();
  const [students, exams, active, completed, stats, recent, monthly, statuses] = await Promise.all([
    User.countDocuments({ role: 'student' }), Exam.countDocuments(),
    Exam.countDocuments({ status: 'published', startAt: { $lte: now }, endAt: { $gte: now } }),
    Result.countDocuments({ submittedAt: { $ne: null } }),
    Result.aggregate([{ $match: { submittedAt: { $ne: null } } }, { $group: { _id: null, highest: { $max: '$score' }, lowest: { $min: '$score' }, average: { $avg: '$score' }, pass: { $sum: { $cond: ['$passed', 1, 0] } } } }]),
    User.find({ role: 'student' }).select('name email mobile createdAt avatar').sort('-createdAt').limit(6),
    Result.aggregate([{ $match: { submittedAt: { $ne: null } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$submittedAt' } }, attempts: { $sum: 1 }, average: { $avg: '$percentage' } } }, { $sort: { _id: 1 } }, { $limit: 12 }]),
    Exam.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
  ]);
  const s = stats[0] || { highest: 0, lowest: 0, average: 0, pass: 0 };
  res.json({ success: true, data: { cards: { students, exams, active, completed, highest: s.highest || 0, lowest: s.lowest || 0, average: Number((s.average || 0).toFixed(1)) }, recent, charts: { monthly, statuses, passFail: [{ name: 'Pass', value: s.pass || 0 }, { name: 'Fail', value: completed - (s.pass || 0) }] } } });
});

export const students = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Number(req.query.limit) || 10, 100);
  const filter = { role: 'student' }; if (req.query.search) filter.$text = { $search: req.query.search };
  const [items, total] = await Promise.all([User.find(filter).sort(req.query.sort || '-createdAt').skip((page - 1) * limit).limit(limit), User.countDocuments(filter)]);
  res.json({ success: true, items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const results = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Number(req.query.limit) || 20, 200);
  const filter = { submittedAt: { $ne: null } }; if (req.query.exam) filter.exam = req.query.exam; if (req.query.passed) filter.passed = req.query.passed === 'true';
  const [items, total] = await Promise.all([Result.find(filter).populate('student', 'name email mobile').populate('exam', 'title totalMarks resultTemplate').sort(req.query.sort || '-submittedAt').skip((page - 1) * limit).limit(limit), Result.countDocuments(filter)]);
  res.json({ success: true, items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const leaderboard = asyncHandler(async (req, res) => {
  const items = await Result.find({ exam: req.params.examId, submittedAt: { $ne: null } }).populate('student', 'name avatar college').sort('-score timeTaken').limit(100);
  res.json({ success: true, items: items.map((item, index) => ({ ...item.toObject(), rank: index + 1 })) });
});
