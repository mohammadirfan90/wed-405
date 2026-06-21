const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

/* ------------------------------------------------------------------ *
 *  List admins                                                        *
 * ------------------------------------------------------------------ */
const listAdmins = asyncHandler(async (req, res) => {
  const { q = '', active } = req.query;
  const filter = {};
  if (active === 'true') filter.isActive = true;
  if (active === 'false') filter.isActive = false;
  if (q.trim()) {
    const re = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: re }, { email: re }, { phone: re }];
  }
  const admins = await Admin.find(filter).sort('-createdAt');
  res.json(admins);
});

/* ------------------------------------------------------------------ *
 *  Get one admin                                                      *
 * ------------------------------------------------------------------ */
const getAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(admin);
});

/* ------------------------------------------------------------------ *
 *  Create a new admin                                                 *
 *  Body: { name, email, phone, password, isSuperAdmin? }              *
 *  - Passwords are hashed automatically by the pre-save hook.        *
 *  - The first admin created by the seed is flagged mustChangePassword *
 * ------------------------------------------------------------------ */
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, isSuperAdmin, isActive } = req.body || {};

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'name, email, phone and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const exists = await Admin.findOne({ $or: [{ email }, { phone }] });
  if (exists) {
    return res.status(409).json({ message: 'An admin with that email or phone already exists' });
  }

  const admin = await Admin.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password,
    isSuperAdmin: Boolean(isSuperAdmin),
    isActive: isActive === false ? false : true,
    mustChangePassword: true,
  });

  res.status(201).json(admin);
});

/* ------------------------------------------------------------------ *
 *  Update an admin                                                    *
 *  Allowed fields: name, email, phone, isActive, isSuperAdmin, role   *
 *  Password changes go through changePassword() so we always hash it. *
 * ------------------------------------------------------------------ */
const updateAdmin = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ['name', 'email', 'phone', 'isActive', 'isSuperAdmin', 'role'];
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k];
  }
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
  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const ok = await admin.comparePassword(currentPassword);
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

  admin.password = newPassword;
  admin.mustChangePassword = false;
  await admin.save();
  res.json({ message: 'Password updated' });
});

/* ------------------------------------------------------------------ *
 *  Hard-delete an admin                                               *
 *  Refuses to delete the last active super admin.                     *
 * ------------------------------------------------------------------ */
const deleteAdmin = asyncHandler(async (req, res) => {
  const target = await Admin.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Admin not found' });

  if (target.isSuperAdmin && target.isActive) {
    const remaining = await Admin.countDocuments({
      _id: { $ne: target._id },
      isSuperAdmin: true,
      isActive: true,
    });
    if (remaining === 0) {
      return res.status(400).json({ message: 'Cannot delete the last active super admin' });
    }
  }

  await target.deleteOne();
  res.json({ message: 'Admin deleted' });
});

/* ------------------------------------------------------------------ *
 *  Quick stats for the dashboard                                      *
 * ------------------------------------------------------------------ */
const stats = asyncHandler(async (req, res) => {
  const [total, active, superAdmins, recent] = await Promise.all([
    Admin.countDocuments(),
    Admin.countDocuments({ isActive: true }),
    Admin.countDocuments({ isSuperAdmin: true, isActive: true }),
    Admin.find().sort('-lastLoginAt').limit(5).select('name email lastLoginAt isActive'),
  ]);
  res.json({ total, active, superAdmins, recent });
});

module.exports = {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  changePassword,
  deleteAdmin,
  stats,
};
