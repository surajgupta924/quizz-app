import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendToken } from '../utils/sendToken.js';

const googleClient = new OAuth2Client();

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;
  if (!credential || !['admin', 'student'].includes(role)) {
    throw new ApiError(422, 'Google credential and a valid role are required');
  }
  if (!process.env.GOOGLE_CLIENT_ID) throw new ApiError(503, 'Google authentication is not configured');

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Google sign-in could not be verified');
  }

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new ApiError(401, 'A verified Google account is required');
  }

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

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));
export const logout = (_req, res) => res.clearCookie('accessToken').json({ success: true, message: 'Logged out' });

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'gender', 'college', 'course', 'year'];
  allowed.forEach(key => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
  if (req.file) req.user.avatar = req.file.path;
  await req.user.save();
  res.json({ success: true, user: req.user, message: 'Profile updated' });
});
