import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import DashboardShell from '../../components/DashboardShell.jsx';

function formatDate(d) {
  if (!d) return 'Never';
  return new Date(d).toLocaleString();
}

export default function ManageAdmins() {
  const { user, fetchMe } = useAuth();
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwFlash, setPwFlash] = useState(null);
  const [changingPw, setChangingPw] = useState(false);

  async function loadStats() {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch {}
  }

  useEffect(() => {
    loadStats();
  }, []);

  function startEdit() {
    if (!user) return;
    setEditing(user);
    setForm({
      username: user.username || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }

  function cancelEdit() {
    setEditing(null);
    setFlash(null);
  }

  async function submitProfile(e) {
    e.preventDefault();
    setFlash(null);
    if (!form.username || !form.name || !form.email || !form.phone) {
      return setFlash({ type: 'err', text: 'Username, Name, email and phone are required' });
    }
    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };
      await api.patch(`/admins/${user._id}`, payload);
      setFlash({ type: 'ok', text: 'Profile updated successfully' });
      setEditing(null);
      await fetchMe();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Profile update failed' });
    } finally {
      setSaving(false);
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    setPwFlash(null);
    if (!currentPassword || !newPassword) {
      return setPwFlash({ type: 'err', text: 'Both current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return setPwFlash({ type: 'err', text: 'New password must be at least 6 characters' });
    }
    setChangingPw(true);
    try {
      await api.post(`/admins/${user._id}/change-password`, {
        currentPassword,
        newPassword,
      });
      setPwFlash({ type: 'ok', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwFlash({ type: 'err', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setChangingPw(false);
    }
  }

  const list = user ? [user] : [];

  return (
    <DashboardShell variant="admin" title="Admin Profile" searchPlaceholder="Search">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-charcoal">Admin Profile</h2>
          <p className="text-sm text-charcoal/70">
            {stats
              ? `${stats.totalBookings} bookings · ${stats.pendingBookings} pending · ${stats.totalPackages} packages`
              : 'Loading stats…'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Profile Card / Table representation */}
        <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-taupe/20 p-6 space-y-4">
          <h3 className="text-base font-semibold text-charcoal">Account Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs uppercase tracking-wider text-charcoal/70">Username</span>
              <span className="font-semibold text-charcoal">{user?.username}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-charcoal/70">Name</span>
              <span className="font-semibold text-charcoal">{user?.name}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-charcoal/70">Email</span>
              <span className="text-charcoal/70">{user?.email}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-charcoal/70">Phone</span>
              <span className="text-charcoal/70">{user?.phone}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-charcoal/70">Role</span>
              <span>
                {user?.isSuperAdmin ? (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold">
                    super admin
                  </span>
                ) : (
                  <span className="rounded-full bg-taupe/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-charcoal/70">
                    admin
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-charcoal/70">Last Login</span>
              <span className="text-charcoal/70">{formatDate(user?.lastLoginAt)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-taupe/20">
            <button
              onClick={startEdit}
              className="rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-gold hover:bg-charcoal/90"
            >
              Edit Profile Details
            </button>
          </div>
        </div>

        {/* Forms side column */}
        <div className="space-y-4">
          {/* Edit Profile Form */}
          {editing && (
            <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-taupe/20">
              <h3 className="text-lg font-semibold text-charcoal">Edit Details</h3>
              <p className="mt-1 text-xs text-charcoal/70">
                Update username, name, email, or phone.
              </p>

              {flash && (
                <p
                  className={
                    'mt-3 rounded-md px-3 py-2 text-sm ' +
                    (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')
                  }
                >
                  {flash.text}
                </p>
              )}

              <form onSubmit={submitProfile} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                    Username
                  </label>
                  <input
                    className="input-field"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                    Name
                  </label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                    Phone (E.164)
                  </label>
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-gold hover:bg-charcoal/90 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md border border-taupe/30 bg-white px-4 py-2 text-sm font-semibold text-charcoal hover:bg-taupe/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Form */}
          <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-taupe/20">
            <h3 className="text-lg font-semibold text-charcoal">Change Password</h3>
            <p className="mt-1 text-xs text-charcoal/70">
              Rotate your account password.
            </p>

            {pwFlash && (
              <p
                className={
                  'mt-3 rounded-md px-3 py-2 text-sm ' +
                  (pwFlash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')
                }
              >
                {pwFlash.text}
              </p>
            )}

            <form onSubmit={submitPassword} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                  Current Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                  New Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="w-full rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-gold hover:bg-charcoal/90 disabled:opacity-60"
                >
                  {changingPw ? 'Updating…' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
