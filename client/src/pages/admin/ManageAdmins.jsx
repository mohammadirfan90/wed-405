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
          <h2 className="text-xl font-semibold text-ink">Admin Profile</h2>
          <p className="text-sm text-ink-muted">
            {stats
              ? `${stats.totalBookings} bookings · ${stats.pendingBookings} pending · ${stats.totalContacts} contacts · ${stats.totalPackages} packages`
              : 'Loading stats…'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Profile Card / Table representation */}
        <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200 p-6 space-y-4">
          <h3 className="text-base font-semibold text-ink">Account Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted">Username</span>
              <span className="font-semibold text-ink">{user?.username}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted">Name</span>
              <span className="font-semibold text-ink">{user?.name}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted">Email</span>
              <span className="text-ink-muted">{user?.email}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted">Phone</span>
              <span className="text-ink-muted">{user?.phone}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted">Role</span>
              <span>
                {user?.isSuperAdmin ? (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
                    super admin
                  </span>
                ) : (
                  <span className="rounded-full bg-lav-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-muted">
                    admin
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted">Last Login</span>
              <span className="text-ink-muted">{formatDate(user?.lastLoginAt)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-lav-100">
            <button
              onClick={startEdit}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Edit Profile Details
            </button>
          </div>
        </div>

        {/* Forms side column */}
        <div className="space-y-4">
          {/* Edit Profile Form */}
          {editing && (
            <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
              <h3 className="text-lg font-semibold text-ink">Edit Details</h3>
              <p className="mt-1 text-xs text-ink-muted">
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
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
                    className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md border border-lav-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-lav-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Form */}
          <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
            <h3 className="text-lg font-semibold text-ink">Change Password</h3>
            <p className="mt-1 text-xs text-ink-muted">
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
                  className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
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
