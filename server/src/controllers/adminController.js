const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

/* ------------------------------------------------------------------ *
 *  Update an admin                                                    *
 *  Allowed fields: name, email, phone, isActive, isSuperAdmin, role   *
 *  Password changes go through changePassword() so we always hash it. *
 * ------------------------------------------------------------------ */
const updateAdmin = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ['username', 'name', 'email', 'phone', 'isActive', 'isSuperAdmin', 'role'];
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k];
  }
  if (updates.username) updates.username = String(updates.username).trim().toLowerCase();
  if (updates.email) updates.email = String(updates.email).trim().toLowerCase();
  if (updates.phone) updates.phone = String(updates.phone).trim();

  // Refuse to demote the last active super admin — that would lock the
  // operator out of the console.
  if (updates.isSuperAdmin === false || updates.isActive === false) {
    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Admin not found' });
    if (target.isSuperAdmin && (updates.isSuperAdmin === false || updates.isActive === false)) {
      const remaining = await Admin.countDocuments({
        _id: { $ne: target._id },
        isSuperAdmin: true,
        isActive: true,
      });
      if (remaining === 0) {
        return res.status(400).json({ message: 'Cannot deactivate the last active super admin' });
      }
    }
  }

  const admin = await Admin.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(admin);
});

/* ------------------------------------------------------------------ *
 *  Change password (requires current password from the caller)         *
 * ------------------------------------------------------------------ */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  // Must explicitly request the password field — it is select:false.
  const admin = await Admin.findById(req.params.id).select('+passwordHash');
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const ok = await admin.comparePassword(currentPassword);
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

  admin.passwordHash = newPassword;
  await admin.save();
  res.json({ message: 'Password updated' });
});

module.exports = {
  updateAdmin,
  changePassword,
};
