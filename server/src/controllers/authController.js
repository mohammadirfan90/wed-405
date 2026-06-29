const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const { signToken, cookieOptions } = require('../utils/token');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const account = await Admin.findOne({ username: String(username).toLowerCase().trim() }).select('+passwordHash');

  if (!account || !account.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await account.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  account.lastLoginAt = new Date();
  account.lastLoginIp = req.ip || null;
  await account.save({ validateBeforeSave: false });

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

module.exports = { login, logout, me };
