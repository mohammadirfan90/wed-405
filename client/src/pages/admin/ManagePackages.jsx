import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const CATEGORIES = ['Wedding', 'Cinematography', 'Pre-Wedding', 'Engagement', 'Event', 'Custom'];
const EMPTY = { title: '', category: 'Wedding', price: 0, currency: 'BDT', duration: '', description: '', features: '', coverImage: '', isActive: true };

export default function ManagePackages() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/packages/admin/all').then(({ data }) => setItems(data));
  useEffect(load, []);

  function startEdit(p) {
    setEditing(p);
    setForm({
      title: p.title, category: p.category, price: p.price, currency: p.currency || 'BDT',
      duration: p.duration || '', description: p.description || '',
      features: (p.features || []).join('\n'), coverImage: p.coverImage || '', isActive: p.isActive ?? true,
    });
  }
  function reset() { setEditing(null); setForm(EMPTY); }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const payload = { ...form, price: Number(form.price), features: form.features.split('\n').map((s) => s.trim()).filter(Boolean) };
    try {
      if (editing) await api.put(`/packages/${editing._id}`, payload);
      else await api.post('/packages', payload);
      reset(); load();
    } finally { setBusy(false); }
  }

  async function remove(id) {
    if (!confirm('Delete this package?')) return;
    await api.delete(`/packages/${id}`);
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Packages" searchPlaceholder="Search">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-ink">Manage Packages</h2>
          <div className="overflow-hidden rounded-xl bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-lav-100 text-left text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id} className="border-t border-lav-200">
                    <td className="px-4 py-3 font-semibold text-ink">{p.title}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.currency} {p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(p)} className="mr-2 text-xs font-semibold text-brand hover:underline">Edit</button>
                      <button onClick={() => remove(p._id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">No packages yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-ink">{editing ? 'Edit package' : 'New package'}</h3>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <input className="input-field w-24" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="input-field w-24" placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            <input className="input-field flex-1" placeholder="Duration (e.g. 6 hrs)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <textarea rows={2} className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea rows={4} className="input-field" placeholder={'Features (one per line)'} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          <input className="input-field" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
          </label>
          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-lav-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-lav-100">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create package'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
