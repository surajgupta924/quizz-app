import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOtp, verifyOtp } from '../utils/otp.js';
import { sendToken } from '../utils/sendToken.js';

const normalize = value => String(value).trim().toLowerCase();
const maybeExpose = code => process.env.EXPOSE_OTP === 'true' && process.env.NODE_ENV !== 'production' ? { devOtp: code } : {};

export const requestRegistrationOtp = asyncHandler(async (req, res) => {
  const role = req.body.role === 'admin' ? 'admin' : 'student';
  if (role === 'admin' && await User.exists({ role: 'admin' })) throw new ApiError(409, 'Administrator registration is already complete');
  const target = normalize(req.body.email);
  if (await User.exists({ $or: [{ email: normalize(req.body.email) }, { mobile: String(req.body.mobile).trim() }] })) throw new ApiError(409, 'Email or mobile number is already registered');
  const code = await createOtp({ target, purpose: `register:${role}` });
  res.json({ success: true, message: 'OTP sent via email', ...maybeExpose(code) });
});

export const register = asyncHandler(async (req, res) => {
  const { name, mobile, email, gender, password, confirmPassword, role = 'student', otp, college, course, year } = req.body;
  if (password !== confirmPassword) throw new ApiError(422, 'Passwords do not match');
  if (role === 'admin' && await User.exists({ role: 'admin' })) throw new ApiError(409, 'Administrator registration is already complete');
  const target = normalize(email);
  if (!await verifyOtp({ target, purpose: `register:${role}`, code: otp })) throw new ApiError(400, 'Invalid or expired OTP');
  await User.create({ name, mobile, email: normalize(email), gender, password, role, college, course, year, isVerified: true, avatar: req.file?.path });
  res.status(201).json({ success: true, message: 'Registration successful. Please log in.' });
});

export const requestLoginOtp = asyncHandler(async (req, res) => {
  const role = req.body.role === 'admin' ? 'admin' : 'student';
  const target = normalize(req.body.email);
  const user = await User.findOne({ email: target, role });
  if (!user) throw new ApiError(404, 'No matching account found');
  const code = await createOtp({ target, purpose: `login:${role}` });
  res.json({ success: true, message: 'OTP sent via email', ...maybeExpose(code) });
});

export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const role = req.body.role === 'admin' ? 'admin' : 'student';
  const target = normalize(req.body.email);
  if (!await verifyOtp({ target, purpose: `login:${role}`, code: req.body.otp })) throw new ApiError(400, 'Invalid or expired OTP');
  const user = await User.findOne({ email: target, role });
  user.lastLoginAt = new Date(); await user.save({ validateBeforeSave: false });
  sendToken(res, user);
});

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));
export const logout = (_req, res) => res.clearCookie('accessToken').json({ success: true, message: 'Logged out' });

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'gender', 'college', 'course', 'year'];
  allowed.forEach(key => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
  if (req.file) req.user.avatar = req.file.path;
  await req.user.save(); res.json({ success: true, user: req.user, message: 'Profile updated' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!await user.comparePassword(req.body.currentPassword)) throw new ApiError(400, 'Current password is incorrect');
  user.password = req.body.newPassword; user.passwordChangedAt = new Date(); await user.save();
  res.json({ success: true, message: 'Password changed' });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const email = normalize(req.body.email);
  const user = await User.findOne({ email });
  let code;
  if (user) code = await createOtp({ target: email, purpose: 'password-reset' });
  res.json({ success: true, message: 'If the account exists, a reset code has been sent', ...(code ? maybeExpose(code) : {}) });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const email = normalize(req.body.email);
  if (!req.body.password || req.body.password.length < 8) throw new ApiError(422, 'Password must be at least 8 characters');
  if (!await verifyOtp({ target: email, purpose: 'password-reset', code: req.body.otp })) throw new ApiError(400, 'Invalid or expired reset code');
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(400, 'Invalid or expired reset code');
  user.password = req.body.password; user.passwordChangedAt = new Date(); await user.save();
  res.clearCookie('accessToken').json({ success: true, message: 'Password reset. You can now sign in.' });
});
