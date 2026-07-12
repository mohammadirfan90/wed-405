import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const EMPTY = {
  title: '',
  body: '',
  image: '',
  order: 0,
};

export default function ManageStorySections() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const load = () => api.get('/content/admin/all?section=story').then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  function startEdit(s) {
    setEditing(s);
    setForm({
      title: s.title || '',
      body: s.body || '',
      image: s.image || '',
      order: s.order || 0,
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
      title: form.title.trim(),
      body: form.body.trim(),
      image: form.image.trim(),
      order: Number(form.order) || 0,
    };
    try {
      if (editing) await api.put(`/content/${editing._id}`, payload);
      else await api.post('/content?section=story', payload);
      setFlash({ type: 'ok', text: editing ? 'Story section updated' : 'Story section created' });
      reset();
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not save' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(s) {
    if (!confirm('Delete this story section? This cannot be undone.')) return;
    await api.delete(`/content/${s._id}`);
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Stories" searchPlaceholder="Search story sections">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-charcoal">About Us & Stories Sections</h2>
          <div className="space-y-4">
            {items.map((s) => (
              <div key={s._id} className="flex gap-4 rounded-xl bg-white p-4 shadow-soft ring-1 ring-taupe/20">
                {s.image && (
                  <img src={s.image} alt="" className="h-24 w-32 shrink-0 rounded-lg object-cover bg-charcoal/10" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-charcoal truncate">{s.title}</h3>
                    <span className="shrink-0 rounded bg-taupe/10 px-2 py-0.5 text-xs font-semibold text-charcoal">
                      Order: {s.order}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-charcoal/70 whitespace-pre-wrap">{s.body}</p>
                  <div className="mt-3 flex gap-2 border-t border-taupe/20 pt-2">
                    <button onClick={() => startEdit(s)} className="rounded border border-taupe/30 px-2.5 py-0.5 text-xs font-semibold text-charcoal hover:bg-taupe/10">
                      Edit
                    </button>
                    <button onClick={() => remove(s)} className="ml-auto text-xs font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-charcoal/70 ring-1 ring-taupe/20">
                No story sections yet
              </p>
            )}
          </div>
        </div>

        <form onSubmit={save} className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-soft ring-1 ring-taupe/20">
          <h3 className="text-base font-semibold text-charcoal">{editing ? 'Edit story section' : 'New story section'}</h3>
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}
          <div>
            <label className="label">Section Title</label>
            <input className="input-field" placeholder="e.g. Welcome To BiyeBuzz.com" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Section Body Text</label>
            <textarea rows={6} className="input-field" placeholder="Description paragraphs..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input-field" placeholder="https://example.com/story.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div>
            <label className="label">Display Order</label>
            <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-taupe/30 px-3 py-2 text-sm font-semibold text-charcoal hover:bg-taupe/10">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create section'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
