import crypto from 'crypto';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const seededShuffle = (array, seed) => {
  const out = [...array]; let state = crypto.createHash('sha256').update(seed).digest().readUInt32LE(0);
  const random = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

export const startAttempt = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ code: req.params.code, status: 'published' });
  if (!exam) throw new ApiError(404, 'This exam is not currently available');
  const now = new Date(); if (now < exam.startAt) throw new ApiError(403, 'The exam has not started yet');
  if (now > exam.endAt) throw new ApiError(403, 'The exam has ended');
  let result = await Result.findOne({ exam: exam._id, student: req.user._id });
  if (result?.submittedAt) throw new ApiError(409, 'You have already completed this exam. Each student can attempt an exam only once.');
  const questions = await Question.find({ exam: exam._id });
  if (!result) {
    const seed = `${exam._id}:${req.user._id}`;
    const order = seededShuffle(questions.map(q => q._id), seed);
    const optionOrders = {};
    questions.forEach(q => { optionOrders[q._id] = seededShuffle(q.options.map(o => o.key), `${seed}:${q._id}`); });
    result = await Result.create({ exam: exam._id, student: req.user._id, startedAt: now, questionOrder: order, optionOrders });
  }
  const questionMap = new Map(questions.map(q => [String(q._id), q]));
  const payload = result.questionOrder.map(id => {
    const q = questionMap.get(String(id)); const keyed = new Map(q.options.map(o => [o.key, o]));
    return { id: q._id, type: q.type, text: q.text, image: q.image, marks: q.marks, difficulty: q.difficulty, options: result.optionOrders.get(String(q._id)).map(key => keyed.get(key)) };
  });
  const deadline = Math.min(new Date(result.startedAt).getTime() + exam.duration * 60000, new Date(exam.endAt).getTime());
  res.json({ success: true, exam: { id: exam._id, title: exam.title, duration: exam.duration, totalMarks: exam.totalMarks }, attempt: { id: result._id, startedAt: result.startedAt, deadline, warnings: result.warnings }, questions: payload });
});

export const registerWarning = asyncHandler(async (req, res) => {
  const result = await Result.findOneAndUpdate({ _id: req.params.id, student: req.user._id, submittedAt: null }, { $inc: { warnings: 1 } }, { new: true });
  if (!result) throw new ApiError(404, 'Active attempt not found');
  res.json({ success: true, warnings: result.warnings, autoSubmit: result.warnings >= 3 });
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await Result.findOne({ _id: req.params.id, student: req.user._id }).populate('exam');
  if (!attempt) throw new ApiError(404, 'Attempt not found');
  if (attempt.submittedAt) return res.json({ success: true, result: attempt, message: 'Attempt was already submitted' });
  const questions = await Question.find({ exam: attempt.exam._id }).select('+correctAnswer');
  const supplied = new Map((req.body.answers || []).map(a => [String(a.question), a.selected]));
  let score = 0; let correct = 0; let wrong = 0; let skipped = 0;
  attempt.answers = questions.map(q => {
    const selected = supplied.get(String(q._id)); let marksAwarded = 0; let isCorrect = false;
    if (!selected) skipped += 1;
    else if (selected === q.correctAnswer) { correct += 1; isCorrect = true; marksAwarded = q.marks; score += q.marks; }
    else { wrong += 1; marksAwarded = attempt.exam.negativeMarking ? -q.negativeMarks : 0; score += marksAwarded; }
    return { question: q._id, selected, correct: isCorrect, marksAwarded };
  });
  attempt.score = Math.max(0, score); attempt.correct = correct; attempt.wrong = wrong; attempt.skipped = skipped;
  attempt.percentage = Number(((attempt.score / attempt.exam.totalMarks) * 100).toFixed(2));
  attempt.passed = attempt.score >= attempt.exam.passingMarks; attempt.submittedAt = new Date();
  attempt.timeTaken = Math.round((attempt.submittedAt - attempt.startedAt) / 1000); attempt.submitReason = req.body.reason || 'manual';
  await attempt.save();
  const rank = await Result.countDocuments({ exam: attempt.exam._id, submittedAt: { $ne: null }, score: { $gt: attempt.score } }) + 1;
  attempt.rank = rank; await attempt.save();
  res.json({ success: true, result: attempt });
});

export const myResults = asyncHandler(async (req, res) => res.json({ success: true, items: await Result.find({ student: req.user._id, submittedAt: { $ne: null } }).populate('exam', 'title subject totalMarks passingMarks resultTemplate').sort('-submittedAt') }));
export const resultDetail = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id }; if (req.user.role === 'student') filter.student = req.user._id;
  const result = await Result.findOne(filter).populate('exam', 'title subject totalMarks passingMarks resultTemplate').populate('student', 'name email mobile college course year');
  if (!result) throw new ApiError(404, 'Result not found');

  const questions = await Question.find({ exam: result.exam._id }).select('+correctAnswer');
  const questionMap = new Map(questions.map(question => [String(question._id), question]));
  const reviewItems = result.answers
    .map(answer => {
      const question = questionMap.get(String(answer.question));
      if (!question || answer.correct) return null;

      const orderedKeys = result.optionOrders?.get?.(String(question._id)) || question.options.map(option => option.key);
      const optionsByKey = new Map(question.options.map(option => [option.key, option]));

      return {
        questionId: question._id,
        text: question.text,
        image: question.image,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        selected: answer.selected || '',
        correctAnswer: question.correctAnswer,
        isSkipped: !answer.selected,
        options: orderedKeys.map(key => optionsByKey.get(key)).filter(Boolean),
      };
    })
    .filter(Boolean);

  res.json({ success: true, result, reviewItems });
});
