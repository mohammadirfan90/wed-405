import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const EMPTY = {
  title: '',
  subtitle: '',
  image: '',
  order: 0,
};

export default function ManageHeroSlides() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const load = () => api.get('/hero/admin/all').then(({ data }) => setItems(data));
  useEffect(load, []);

  function startEdit(s) {
    setEditing(s);
    setForm({
      title: s.title || '',
      subtitle: s.subtitle || '',
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
      subtitle: form.subtitle.trim(),
      image: form.image.trim(),
      order: Number(form.order) || 0,
    };
    try {
      if (editing) await api.put(`/hero/${editing._id}`, payload);
      else await api.post('/hero', payload);
      setFlash({ type: 'ok', text: editing ? 'Slide updated' : 'Slide created' });
      reset();
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not save' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(s) {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    await api.delete(`/hero/${s._id}`);
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Hero Slides" searchPlaceholder="Search slides">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-ink">Hero Section Slides</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((s) => (
              <div key={s._id} className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200">
                <div className="relative h-40 bg-ink/10">
                  {s.image ? (
                    <img src={s.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-ink-muted">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 rounded bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white">
                    Order: {s.order}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-bold text-ink">{s.title || '(No title)'}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{s.subtitle}</p>
                  <div className="mt-4 flex gap-2 border-t border-lav-200 pt-3">
                    <button onClick={() => startEdit(s)} className="rounded-md border border-lav-300 px-3 py-1 text-xs font-semibold text-ink hover:bg-lav-100">
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
              <p className="rounded-xl bg-white p-6 text-center text-sm text-ink-muted ring-1 ring-lav-200 sm:col-span-2">
                No hero slides yet
              </p>
            )}
          </div>
        </div>

        <form onSubmit={save} className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          <h3 className="text-base font-semibold text-ink">{editing ? 'Edit hero slide' : 'New hero slide'}</h3>
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="Heading Text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Subtitle / Description</label>
            <textarea rows={3} className="input-field" placeholder="Sub-heading Text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input-field" placeholder="https://example.com/slide.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
          </div>
          <div>
            <label className="label">Display Order</label>
            <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-lav-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-lav-100">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create slide'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
