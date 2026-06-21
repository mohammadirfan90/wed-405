const { verifyToken } = require('../utils/token');
const User = require('../models/User');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

async function loadUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    // The JWT carries `role`. Try the matching collection first so a sub
    // collision between User and Admin _ids can never happen.
    let account = null;
    if (payload.role === 'admin') {
      account = await Admin.findById(payload.sub);
      if (!account) account = await User.findById(payload.sub);
    } else {
      account = await User.findById(payload.sub);
      if (!account) account = await Admin.findById(payload.sub);
    }
    if (!account || !account.isActive) return null;
    return account;
  } catch {
    return null;
  }
}

const protect = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const cookieToken = req.cookies?.token;
  const token = bearer || cookieToken;
  const user = await loadUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  req.user = user;
  next();
});

const optionalProtect = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const cookieToken = req.cookies?.token;
  const token = bearer || cookieToken;
  if (token) {
    const user = await loadUserFromToken(token);
    if (user) req.user = user;
  }
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

const adminOnly = [protect, requireRole('admin')];

module.exports = { protect, optionalProtect, requireRole, adminOnly };
