import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const ROLE_TONE = {
  admin: 'bg-brand text-white',
  user: 'bg-lav-100 text-ink',
};

function StatusPill({ active }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
      Disabled
    </span>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(iso).toLocaleDateString();
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'user' | 'admin'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'disabled'
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/users')
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function changeRole(u, role) {
    if (u.role === role) return;
    if (!confirm(`Change ${u.name}'s role to ${role}?`)) return;
    setBusyId(u._id);
    try {
      await api.patch(`/users/${u._id}`, { role });
      setFlash({ type: 'ok', text: `Updated ${u.name} → ${role}` });
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not update role' });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(u) {
    const next = !u.isActive;
    if (!confirm(`${next ? 'Disable' : 'Re-enable'} ${u.name}?`)) return;
    setBusyId(u._id);
    try {
      await api.patch(`/users/${u._id}`, { isActive: next });
      setFlash({ type: 'ok', text: `${u.name} ${next ? 'disabled' : 're-enabled'}` });
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not update status' });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(u) {
    if (!confirm(`Permanently disable ${u.name}? Bookings and history are kept; they just can no longer sign in.`)) return;
    setBusyId(u._id);
    try {
      await api.delete(`/users/${u._id}`);
      setFlash({ type: 'ok', text: `${u.name} disabled` });
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not disable user' });
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'disabled' && u.isActive) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      active: users.filter((u) => u.isActive).length,
    };
  }, [users]);

  return (
    <DashboardShell variant="admin" title="Manage Users" searchPlaceholder="Search by name, phone, or email">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Manage Users</h2>
          <p className="text-sm text-ink-muted">
            {summary.total} total · {summary.admins} admin{summary.admins === 1 ? '' : 's'} · {summary.active} active
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="input-field w-56"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {flash && (
        <p className={'mb-3 rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
          {flash.text}
        </p>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200">
        <table className="w-full text-sm">
          <thead className="bg-lav-100 text-left text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-t border-lav-200">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{u.name}</div>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  <div>{u.phone}</div>
                  <div className="text-xs">{u.email || '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ' + (ROLE_TONE[u.role] || 'bg-lav-100 text-ink')}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusPill active={u.isActive} /></td>
                <td className="px-4 py-3 text-xs text-ink-muted">{timeAgo(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={busyId === u._id}
                      onClick={() => changeRole(u, u.role === 'admin' ? 'user' : 'admin')}
                      className="rounded-md border border-lav-300 px-2 py-1 text-xs font-semibold text-ink hover:bg-lav-100 disabled:opacity-50"
                    >
                      {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      disabled={busyId === u._id}
                      onClick={() => toggleActive(u)}
                      className="rounded-md border border-lav-300 px-2 py-1 text-xs font-semibold text-ink hover:bg-lav-100 disabled:opacity-50"
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      disabled={busyId === u._id || !u.isActive}
                      onClick={() => remove(u)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-muted">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
