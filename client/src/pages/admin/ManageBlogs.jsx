import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const EMPTY = {
  title: '',
  excerpt: '',
  body: '',
  coverImage: '',
  tags: '',
  isPublished: false,
  publishedAt: '',
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

export default function ManageBlogs() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const load = () => api.get('/blogs/admin/all').then(({ data }) => setItems(data));
  useEffect(load, []);

  function startEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || '',
      excerpt: p.excerpt || '',
      body: p.body || '',
      coverImage: p.coverImage || '',
      tags: (p.tags || []).join(', '),
      isPublished: p.isPublished ?? false,
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 10) : '',
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
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      publishedAt: form.isPublished && !form.publishedAt
        ? new Date().toISOString()
        : form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    };
    try {
      if (editing) await api.put(`/blogs/${editing._id}`, payload);
      else await api.post('/blogs', payload);
      setFlash({ type: 'ok', text: editing ? 'Blog updated' : 'Blog created' });
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
    await api.delete(`/blogs/${p._id}`);
    load();
  }

  async function togglePublished(p) {
    await api.put(`/blogs/${p._id}`, { isPublished: !p.isPublished });
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Blogs" searchPlaceholder="Search blogs">
      <div className="grid gap-6 lg:grid-cols-[1fr_460px]">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-ink">Manage Blogs</h2>
          <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200">
            <table className="w-full text-sm">
              <thead className="bg-lav-100 text-left text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Published</th>
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
                    <td className="px-4 py-3 text-ink-muted">{p.authorName || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(p.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(p)}
                        className={
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ' +
                          (p.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700')
                        }
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
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">No blog posts yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          <h3 className="text-base font-semibold text-ink">{editing ? 'Edit blog post' : 'New blog post'}</h3>
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input-field" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <textarea rows={2} className="input-field" placeholder="Short excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea rows={8} className="input-field" placeholder="Body (markdown / plain text)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          <input className="input-field" placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Publish
          </label>
          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-lav-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-lav-100">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}