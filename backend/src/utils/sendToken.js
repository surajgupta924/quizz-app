import jwt from 'jsonwebtoken';

export const sendToken = (res, user, statusCode = 200) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', token, {
    httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', maxAge: 7 * 86400000,
  });
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, avatar: user.avatar },
  });
};
