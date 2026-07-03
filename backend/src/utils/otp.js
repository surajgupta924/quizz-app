import crypto from 'crypto';
import nodemailer from 'nodemailer';
import OTP from '../models/OTP.js';

const hashOtp = (value) => crypto.createHmac('sha256', process.env.OTP_PEPPER || process.env.JWT_SECRET).update(value).digest('hex');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
    if (process.env.EXPOSE_OTP === 'true' && process.env.NODE_ENV !== 'production') return null;
    throw new Error('Email delivery is not configured');
  }
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { minVersion: 'TLSv1.2' },
  });
};

export const createOtp = async ({ target, purpose }) => {
  const code = String(crypto.randomInt(100000, 1000000));
  const action = purpose.startsWith('register:') ? 'complete your registration' : purpose.startsWith('login:') ? 'sign in to your account' : 'reset your password';
  await OTP.deleteMany({ target, purpose });
  await OTP.create({ target, purpose, channel: 'email', codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 5 * 60000) });
  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: target,
      subject: 'Your CodingClave Development verification code',
      text: `Use ${code} to ${action}. This code expires in 5 minutes. Do not share it with anyone.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#1e293b"><h2 style="margin:0 0 12px">CodingClave Development LLP</h2><p>Use this one-time code to ${action}:</p><div style="margin:24px 0;padding:18px;text-align:center;background:#f1f5f9;border-radius:12px;font-size:32px;font-weight:700;letter-spacing:8px;color:#4f46e5">${code}</div><p style="color:#64748b">This code expires in 5 minutes. Do not share it with anyone.</p></div>`,
    });
  }
  return code;
};

export const verifyOtp = async ({ target, purpose, code }) => {
  const record = await OTP.findOne({ target, purpose, consumedAt: null }).select('+codeHash');
  if (!record || record.expiresAt < new Date() || record.attempts >= 5) return false;
  record.attempts += 1;
  const valid = crypto.timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(hashOtp(String(code))));
  if (valid) record.consumedAt = new Date();
  await record.save();
  return valid;
};
