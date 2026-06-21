const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Admin: list users (newest first)
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json(users);
});

// Admin: get one user
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Admin: update role and/or active status for a user
const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  if (typeof req.body.role === 'string') {
    if (!['user', 'admin'].includes(req.body.role)) {
      return res.status(400).json({ message: 'role must be "user" or "admin"' });
    }
    updates.role = req.body.role;
  }
  if (typeof req.body.isActive === 'boolean') {
    updates.isActive = req.body.isActive;
  }
  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    updates.name = req.body.name.trim();
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Admin: soft-delete by deactivating (we keep history intact)
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deactivated', user });
});

module.exports = { listUsers, getUser, updateUser, deactivateUser };