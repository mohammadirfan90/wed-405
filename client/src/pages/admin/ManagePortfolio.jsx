import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const CATEGORIES = ['Wedding', 'Pre-Wedding', 'Engagement', 'Event', 'Cinematography', 'Other'];
const EMPTY = {
  title: '',
  category: 'Wedding',
  coverImage: '',
  description: '',
  eventDate: '',
  location: '',
  tags: '',
  images: '',
  isPublished: true,
};

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export default function ManagePortfolio() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const load = () => api.get('/gallery/admin/all').then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || '',
      category: p.category || 'Wedding',
      coverImage: p.coverImage || '',
      description: p.description || '',
      eventDate: p.eventDate ? new Date(p.eventDate).toISOString().slice(0, 10) : '',
      location: p.location || '',
      tags: (p.tags || []).join(', '),
      images: (p.images || []).join('\n'),
      isPublished: p.isPublished ?? true,
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
      ...form,
      slug: slugify(form.title),
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.put(`/gallery/${editing._id}`, payload);
      else await api.post('/gallery', payload);
      setFlash({ type: 'ok', text: editing ? 'Portfolio item updated' : 'Portfolio item created' });
      reset();
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not save' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await api.delete(`/gallery/${p._id}`);
    load();
  }

  async function togglePublished(p) {
    await api.put(`/gallery/${p._id}`, { isPublished: !p.isPublished });
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Portfolio" searchPlaceholder="Search portfolio">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-ink">Manage Portfolio</h2>
          <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200">
            <table className="w-full text-sm">
              <thead className="bg-lav-100 text-left text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Event Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id} className="border-t border-lav-200">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">{p.title}</div>
                      <div className="text-xs text-ink-muted">/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(p.eventDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(p)}
                        className={
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ' +
                          (p.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700')
                        }
                        title="Toggle publish status"
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(p)} className="mr-2 text-xs font-semibold text-brand hover:underline">Edit</button>
                      <button onClick={() => remove(p)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">No portfolio items yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          <h3 className="text-base font-semibold text-ink">{editing ? 'Edit portfolio item' : 'New portfolio item'}</h3>
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="input-field" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <input className="input-field" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
          <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="input-field" placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <textarea rows={3} className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea rows={4} className="input-field" placeholder={'Gallery image URLs (one per line)'} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Published
          </label>
          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-lav-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-lav-100">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create item'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}