import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendToken } from '../utils/sendToken.js';

const googleClient = new OAuth2Client();
const googleClientId = process.env.GOOGLE_CLIENT_ID || '853043782431-aqt6s08th1uob7tcf41kha5f77m03r7b.apps.googleusercontent.com';
const defaultAdminSecretHash = 'cac22749f3eda89ee9b4f5524388376e3da780ac87ec855bd57e74dcdb6e4201';
const hashSecret = value => crypto.createHash('sha256').update(String(value || '')).digest();
const mobilePattern = /^[6-9]\d{9}$/;
const adminSecretIsValid = value => {
  const expected = process.env.ADMIN_SECRET_KEY ? hashSecret(process.env.ADMIN_SECRET_KEY) : Buffer.from(defaultAdminSecretHash, 'hex');
  return crypto.timingSafeEqual(hashSecret(value), expected);
};

const verifyGoogleCredential = async credential => {
  if (!credential) throw new ApiError(422, 'Google credential is required');
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new ApiError(401, 'A verified Google account is required');
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Google sign-in could not be verified');
  }
};

export const verifyAdminSecret = asyncHandler(async (req, res) => {
  if (!adminSecretIsValid(req.body.secret)) throw new ApiError(403, 'Invalid administrator secret key');
  res.json({ success: true, message: 'Administrator key verified' });
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role, adminSecret } = req.body;
  if (!credential || !['admin', 'student'].includes(role)) {
    throw new ApiError(422, 'Google credential and a valid role are required');
  }
  if (role === 'admin' && !adminSecretIsValid(adminSecret)) {
    throw new ApiError(403, 'Invalid administrator secret key');
  }
  const payload = await verifyGoogleCredential(credential);

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });

  if (user) {
    if (user.role !== role) throw new ApiError(403, `This Google account is registered as ${user.role}`);
    if (user.googleId && user.googleId !== payload.sub) throw new ApiError(409, 'Email is linked to another Google account');
    user.googleId = payload.sub;
    user.authProvider = 'google';
    user.isVerified = true;
    if (!user.avatar && payload.picture) user.avatar = payload.picture;
  } else {
    if (role === 'student') {
      throw new ApiError(404, 'Student account not found. Please complete registration first.');
    }
    if (role === 'admin' && await User.exists({ role: 'admin' })) {
      throw new ApiError(403, 'Administrator registration is already complete');
    }
    user = new User({
      googleId: payload.sub,
      authProvider: 'google',
      name: payload.name || email.split('@')[0],
      email,
      mobile: `google-${payload.sub}`,
      gender: 'prefer-not-to-say',
      role,
      avatar: payload.picture,
      isVerified: true,
    });
  }

  user.lastLoginAt = new Date();
  await user.save();
  sendToken(res, user);
});

export const registerStudent = asyncHandler(async (req, res) => {
  const { credential, name, college, dob, mobile, email } = req.body;
  if (!name?.trim() || !college?.trim() || !dob || !mobile?.trim() || !email?.trim()) {
    throw new ApiError(422, 'All registration details are required');
  }
  if (!mobilePattern.test(String(mobile).trim())) {
    throw new ApiError(422, 'Mobile number must be 10 digits and start with 6, 7, 8, or 9');
  }

  const payload = await verifyGoogleCredential(credential);
  const verifiedEmail = payload.email.toLowerCase();
  const requestedEmail = String(email).trim().toLowerCase();
  if (verifiedEmail !== requestedEmail) {
    throw new ApiError(422, 'Registration email must match the verified Google account');
  }

  const existingMobileOwner = await User.findOne({ mobile: String(mobile).trim() });
  if (existingMobileOwner && String(existingMobileOwner.googleId || '') !== String(payload.sub)) {
    throw new ApiError(409, 'This mobile number is already registered');
  }

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: verifiedEmail }] });
  if (user && user.role !== 'student') throw new ApiError(403, 'This Google account is registered as admin');

  if (!user) {
    user = new User({
      googleId: payload.sub,
      authProvider: 'google',
      role: 'student',
      gender: 'prefer-not-to-say',
    });
  }

  user.googleId = payload.sub;
  user.authProvider = 'google';
  user.name = String(name).trim();
  user.college = String(college).trim();
  user.dob = new Date(dob);
  user.mobile = String(mobile).trim();
  user.email = verifiedEmail;
  user.avatar = user.avatar || payload.picture;
  user.isVerified = true;
  user.lastLoginAt = new Date();

  if (Number.isNaN(user.dob?.getTime?.())) throw new ApiError(422, 'Please provide a valid date of birth');

  await user.save();
  sendToken(res, user);
});

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));
export const logout = (_req, res) => res.clearCookie('accessToken').json({ success: true, message: 'Logged out' });

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'gender', 'college', 'course', 'year', 'dob'];
  allowed.forEach(key => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
  if (req.file) req.user.avatar = req.file.path;
  await req.user.save();
  res.json({ success: true, user: req.user, message: 'Profile updated' });
});
