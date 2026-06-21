import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const EMPTY = {
  authorName: '',
  role: '',
  avatar: '',
  rating: 5,
  body: '',
  package: '',
  isApproved: false,
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(iso).toLocaleDateString();
}

export default function ManageTestimonials() {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | approved

  const load = () => api.get('/testimonials/admin/all').then(({ data }) => setItems(data));
  useEffect(() => {
    load();
    api.get('/packages').then(({ data }) => setPackages(data)).catch(() => setPackages([]));
  }, []);

  function startEdit(t) {
    setEditing(t);
    setForm({
      authorName: t.authorName || '',
      role: t.role || '',
      avatar: t.avatar || '',
      rating: t.rating || 5,
      body: t.body || '',
      package: t.package?._id || t.package || '',
      isApproved: !!t.isApproved,
    });
  }
  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setFlash(null);
    const payload = {
      authorName: form.authorName.trim(),
      role: form.role.trim(),
      avatar: form.avatar.trim(),
      rating: Number(form.rating) || 5,
      body: form.body.trim(),
      package: form.package || undefined,
      isApproved: !!form.isApproved,
    };
    try {
      if (editing) await api.put(`/testimonials/${editing._id}`, payload);
      else await api.post('/testimonials', payload);
      setFlash({ type: 'ok', text: editing ? 'Testimonial updated' : 'Testimonial created' });
      reset();
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not save' });
    } finally {
      setBusy(false);
    }
  }

  async function toggleApproved(t) {
    await api.put(`/testimonials/${t._id}`, { isApproved: !t.isApproved });
    setFlash({ type: 'ok', text: `${t.authorName}: ${!t.isApproved ? 'approved' : 'unapproved'}` });
    load();
  }
  async function remove(t) {
    if (!confirm(`Delete testimonial from ${t.authorName}?`)) return;
    await api.delete(`/testimonials/${t._id}`);
    setFlash({ type: 'ok', text: 'Testimonial deleted' });
    load();
  }

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (filter === 'approved') return !!t.isApproved;
      if (filter === 'pending') return !t.isApproved;
      return true;
    });
  }, [items, filter]);

  const counts = useMemo(() => {
    return {
      total: items.length,
      approved: items.filter((t) => t.isApproved).length,
      pending: items.filter((t) => !t.isApproved).length,
    };
  }, [items]);

  return (
    <DashboardShell variant="admin" title="Testimonials" searchPlaceholder="Search testimonials">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Manage Testimonials</h2>
          <p className="text-sm text-ink-muted">
            {counts.total} total · {counts.pending} pending · {counts.approved} approved
          </p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={
                'rounded-full px-3 py-1 text-xs font-semibold capitalize ' +
                (filter === s ? 'bg-brand text-white' : 'bg-lav-100 text-ink hover:bg-lav-200')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <div key={t._id} className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <img src={t.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-lav-200 text-sm font-bold text-ink">
                      {t.authorName?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-ink">{t.authorName}</div>
                    <div className="text-xs text-ink-muted">{t.role || 'Client'}</div>
                  </div>
                </div>
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ' +
                    (t.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                  }
                >
                  {t.isApproved ? 'approved' : 'pending'}
                </span>
              </div>
              <div className="mb-2 flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n}>{n <= (t.rating || 5) ? '★' : '☆'}</span>
                ))}
              </div>
              <p className="mb-2 line-clamp-3 text-sm italic text-ink">“{t.body}”</p>
              <div className="mb-3 text-xs text-ink-muted">
                {t.package?.title || '—'} · {timeAgo(t.createdAt)}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-lav-200 pt-3">
                <button
                  onClick={() => toggleApproved(t)}
                  className={
                    'rounded-md px-3 py-1 text-xs font-semibold text-white ' +
                    (t.isApproved ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700')
                  }
                >
                  {t.isApproved ? 'Unapprove' : 'Approve'}
                </button>
                <button onClick={() => startEdit(t)} className="rounded-md border border-lav-300 px-3 py-1 text-xs font-semibold text-ink hover:bg-lav-100">
                  Edit
                </button>
                <button onClick={() => remove(t)} className="ml-auto text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-ink-muted ring-1 ring-lav-200 md:col-span-2">
              No testimonials
            </p>
          )}
        </div>

        <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          <h3 className="text-base font-semibold text-ink">{editing ? 'Edit testimonial' : 'New testimonial'}</h3>
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}
          <input className="input-field" placeholder="Author name" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required />
          <input className="input-field" placeholder="Role (e.g. Bride, Groom)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input className="input-field" placeholder="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          <select className="input-field" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
          </select>
          <select className="input-field" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })}>
            <option value="">— No package —</option>
            {packages.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <textarea rows={4} className="input-field" placeholder="Testimonial body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} />
            Approved
          </label>
          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-lav-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-lav-100">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create testimonial'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}