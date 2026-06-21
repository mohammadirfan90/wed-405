const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Dedicated "admins" collection.
 *
 * Why a separate collection?
 *   - Cleaner separation of concerns: admin accounts have stricter rules
 *     (force password change on first login, must rotate periodically,
 *     audit log of every action) than customer accounts.
 *   - Lets us add admin-only fields later (twoFactorSecret, ipAllowList,
 *     loginAttempts, lastLoginAt, etc.) without bloating the customer model.
 *   - Independent backups / retention / access scope in MongoDB.
 *
 * The collection name is explicitly "admins" so it sits alongside "users"
 * in the same `chronos_moments` database but is queried on its own.
 */
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+[1-9]\d{6,14}$/, 'Phone must be in international format, e.g. +8801XXXXXXXXX'],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },

    // bcrypt hash. `select: false` so accidental .find() never leaks it.
    password: { type: String, required: true, minlength: 6, select: false },

    // Admin can be promoted/demoted only via the admin console.
    // For this collection we always force 'admin' on save, but keep the field
    // so the schema matches the rest of the app.
    role: { type: String, enum: ['admin'], default: 'admin', required: true },

    isActive: { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false },

    // First-login guard: seed sets this true, admin flips it after changing the
    // bootstrap password. Optional in the UI — purely informational.
    mustChangePassword: { type: Boolean, default: false },

    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
  },
  { timestamps: true, collection: 'admins' }
);

// Hash password before save when it changed.
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper for the login controller.
adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Strip the hash before sending to the client.
adminSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

// Partial unique indexes — same pattern as the User model so null/blank
// values don't trigger duplicate-key errors, but real values stay unique.
adminSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
adminSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
adminSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Admin', adminSchema);
