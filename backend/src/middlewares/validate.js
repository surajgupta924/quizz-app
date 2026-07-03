import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new ApiError(422, 'Please correct the highlighted fields', errors.array()));
  next();
};
