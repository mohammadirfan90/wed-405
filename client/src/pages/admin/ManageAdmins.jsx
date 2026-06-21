import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

const emptyForm = { name: '', email: '', phone: '', password: '', isSuperAdmin: false };

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);   // admin being edited (or null)
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [flash, setFlash] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: list }, { data: st }] = await Promise.all([
      api.get('/admins'),
      api.get('/admins/stats/summary'),
    ]);
    setAdmins(list);
    setStats(st);
  }
  useEffect(() => { load(); }, []);

  const filtered = admins.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q)
    );
  });

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
  }
  function startEdit(a) {
    setCreating(false);
    setEditing(a);
    setForm({
      name: a.name || '',
      email: a.email || '',
      phone: a.phone || '',
      password: '',
      isSuperAdmin: !!a.isSuperAdmin,
    });
  }
  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  }

  async function submit(e) {
    e.preventDefault();
    setFlash(null);
    if (!form.name || !form.email || !form.phone) {
      return setFlash({ type: 'err', text: 'Name, email and phone are required' });
    }
    if (creating && !form.password) {
      return setFlash({ type: 'err', text: 'Password is required when creating an admin' });
    }
    setSaving(true);
    try {
      if (creating) {
        await api.post('/admins', form);
        setFlash({ type: 'ok', text: 'Admin created' });
      } else if (editing) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          isSuperAdmin: form.isSuperAdmin,
        };
        await api.patch(`/admins/${editing._id}`, payload);
        setFlash({ type: 'ok', text: 'Admin updated' });
      }
      cancelForm();
      await load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(a) {
    if (!confirm(`Delete admin ${a.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admins/${a._id}`);
      setFlash({ type: 'ok', text: 'Admin deleted' });
      if (editing?._id === a._id) cancelForm();
      await load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Delete failed' });
    }
  }

  async function toggleActive(a) {
    try {
      await api.patch(`/admins/${a._id}`, { isActive: !a.isActive });
      await load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Toggle failed' });
    }
  }

  return (
    <DashboardShell variant="admin" title="Admin Team" searchPlaceholder="Search admins">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Admin Team</h2>
          <p className="text-sm text-ink-muted">
            {stats
              ? `${stats.total} total · ${stats.active} active · ${stats.superAdmins} super admin${stats.superAdmins === 1 ? '' : 's'}`
              : 'Loading…'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name/email/phone…"
            className="input-field w-64"
          />
          <button
            onClick={startCreate}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New admin
          </button>
        </div>
      </div>

      {flash && (
        <p
          className={
            'mb-3 rounded-md px-3 py-2 text-sm ' +
            (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')
          }
        >
          {flash.text}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* List */}
        <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200">
          <table className="min-w-full divide-y divide-lav-200 text-sm">
            <thead className="bg-lav-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Last login</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lav-100">
              {filtered.map((a) => (
                <tr key={a._id} className="hover:bg-lav-50/60">
                  <td className="px-4 py-2 font-semibold text-ink">{a.name}</td>
                  <td className="px-4 py-2 text-ink-muted">{a.email}</td>
                  <td className="px-4 py-2 text-ink-muted">{a.phone}</td>
                  <td className="px-4 py-2">
                    {a.isSuperAdmin ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
                        super
                      </span>
                    ) : (
                      <span className="rounded-full bg-lav-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-muted">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-ink-muted">{formatDate(a.lastLoginAt)}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleActive(a)}
                      className={
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ' +
                        (a.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700')
                      }
                    >
                      {a.isActive ? 'active' : 'disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => startEdit(a)}
                      className="mr-2 rounded-md border border-lav-300 bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-lav-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(a)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-ink-muted">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          <h3 className="text-lg font-semibold text-ink">
            {creating ? 'Create admin' : editing ? 'Edit admin' : 'Select an admin'}
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            {creating
              ? 'A new record will be added to the chronos_moments.admins collection.'
              : editing
              ? 'Changes are saved back to the admins collection.'
              : 'Use Edit on a row to update, or "+ New admin" to add one.'}
          </p>

          {(creating || editing) && (
            <form onSubmit={submit} className="mt-4 space-y-3">
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
                  placeholder="+8801700000000"
                  required
                />
              </div>
              {creating && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isSuperAdmin}
                  onChange={(e) => setForm({ ...form, isSuperAdmin: e.target.checked })}
                />
                Super admin (can manage other admins)
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : creating ? 'Create admin' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-md border border-lav-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-lav-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
