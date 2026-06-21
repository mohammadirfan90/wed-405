const User = require('../models/User');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const { signToken, cookieOptions } = require('../utils/token');
const { normalizePhone } = require('../utils/phone');
const crypto = require('crypto');

// Always return the same shape to avoid leaking which side (email/phone) is registered.
const genericResetMessage = 'If that account exists, a reset code has been sent.';

function newOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'name, phone and password are required' });
  }
  const phoneNorm = normalizePhone(phone);
  const phoneExists = await User.findOne({ phone: phoneNorm });
  if (phoneExists) return res.status(409).json({ message: 'Phone already registered' });

  // Normalize email to lowercase and check for collisions explicitly
  // so we never surface a raw Mongo E11000 to the client.
  const emailNorm = email ? String(email).trim().toLowerCase() : undefined;
  if (emailNorm) {
    const emailExists = await User.findOne({ email: emailNorm });
    if (emailExists) {
      return res.status(409).json({
        message: 'Email already registered. Please log in or use a different email.',
        field: 'email',
      });
    }
  }

  try {
    const user = await User.create({ name, phone: phoneNorm, email: emailNorm, password });
    const token = signToken(user._id, user.role);
    res.cookie('token', token, cookieOptions());
    res.status(201).json({ user, token });
  } catch (err) {
    if (err && err.code === 11000) {
      const key = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        message: key === 'email'
          ? 'Email already registered. Please log in or use a different email.'
          : key === 'phone'
          ? 'Phone already registered.'
          : `${key} already in use.`,
        field: key,
      });
    }
    throw err;
  }
});

// POST /api/auth/login
// Resolution order:
//   1. Dedicated `admins` collection (preferred — bootstrapped by seedAdmin.js).
//   2. `users` collection — admins created via /api/users (role='admin') still
//      work, and customer accounts still log in normally.
// This keeps the existing AdminLogin.jsx and Login.jsx untouched.
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: 'phone and password are required' });
  }
  const phoneNorm = normalizePhone(phone);

  let account = null;
  let source = null;

  // 1) Dedicated admins collection
  account = await Admin.findOne({ phone: phoneNorm }).select('+password');
  if (account) source = 'admin';

  // 2) Fall back to users (customer accounts, plus legacy admin-promoted users)
  if (!account) {
    account = await User.findOne({ phone: phoneNorm }).select('+password');
    if (account) source = 'user';
  }

  if (!account || !account.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await account.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  // Stamp last login for the dedicated admin collection so the dashboard can
  // show "recent sign-ins" without another collection.
  if (source === 'admin') {
    account.lastLoginAt = new Date();
    account.lastLoginIp = req.ip || null;
    await account.save({ validateBeforeSave: false });
  }

  const token = signToken(account._id, account.role);
  res.cookie('token', token, cookieOptions());
  res.json({ user: account.toJSON(), token });
});

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { ...cookieOptions(), maxAge: 0 });
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
// Body: { identifier: "phone" | "email" }
// Looks the user up and stamps a hashed 6-digit OTP + 10-minute expiry.
const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier) {
    return res.status(400).json({ message: 'identifier is required (phone or email)' });
  }
  const isEmail = identifier.includes('@');
  const query = isEmail
    ? { email: identifier.trim().toLowerCase() }
    : { phone: normalizePhone(identifier) };

  const user = await User.findOne(query);
  if (user) {
    const otp = newOtp();
    user.resetPasswordOtp = hashOtp(otp);
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Dev delivery — in production, send via email/SMS provider.
    // Keep the channel name generic so the client doesn't see this log.
    console.log(`[auth] Password reset OTP for ${identifier}: ${otp} (expires in 10 min)`);
  }
  res.json({ message: genericResetMessage });
});

// POST /api/auth/reset-password
// Body: { identifier, otp, newPassword }
const resetPassword = asyncHandler(async (req, res) => {
  const { identifier, otp, newPassword } = req.body || {};
  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ message: 'identifier, otp and newPassword are required' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const isEmail = identifier.includes('@');
  const query = isEmail
    ? { email: identifier.trim().toLowerCase() }
    : { phone: normalizePhone(identifier) };

  const user = await User.findOne(query);
  if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  if (user.resetPasswordExpires.getTime() < Date.now()) {
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
  }
  if (user.resetPasswordAttempts >= 5) {
    return res.status(429).json({ message: 'Too many attempts. Please request a new code.' });
  }
  if (hashOtp(String(otp).trim()) !== user.resetPasswordOtp) {
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: 'Invalid code' });
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpires = undefined;
  user.resetPasswordAttempts = 0;
  await user.save();

  const token = signToken(user._id, user.role);
  res.cookie('token', token, cookieOptions());
  res.json({ user: user.toJSON(), token, message: 'Password updated. You are now signed in.' });
});

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
