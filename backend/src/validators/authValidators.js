import { body } from 'express-validator';
export const registrationRules = [
  body('name').trim().isLength({ min: 2, max: 80 }), body('email').isEmail().normalizeEmail(),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'), body('gender').isIn(['male', 'female', 'other', 'prefer-not-to-say']),
  body('password').isLength({ min: 8 }).matches(/[A-Za-z]/).matches(/\d/), body('confirmPassword').notEmpty(), body('otp').isLength({ min: 6, max: 6 }),
];
export const requestRegistrationRules = [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number')];
export const loginRequestRules = [body('role').isIn(['admin', 'student']), body('email').isEmail().normalizeEmail()];
export const loginVerifyRules = [...loginRequestRules, body('otp').isLength({ min: 6, max: 6 })];
