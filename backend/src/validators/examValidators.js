import { body } from 'express-validator';
export const examRules = [
  body('title').trim().notEmpty(),
  body('subject').trim().notEmpty(),
  body('duration').isInt({ min: 1, max: 1440 }),
  body('startAt').isISO8601(),
  body('passingMarks').isFloat({ min: 0 }).custom((value, { req }) => Number(value) <= Number(req.body.totalMarks)).withMessage('Passing marks cannot exceed total marks'),
  body('totalMarks').isFloat({ min: 1 }),
  body('status').optional().isIn(['draft', 'scheduled', 'published', 'closed']),
  body('resultTemplate').optional().isIn(['classic', 'celebration', 'minimal']),
];
export const questionRules = [body('text').trim().notEmpty(), body('options').isArray({ min: 2, max: 6 }), body('correctAnswer').notEmpty(), body('marks').isFloat({ min: 0 })];
