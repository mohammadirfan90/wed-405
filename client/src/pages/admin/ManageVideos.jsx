import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const EMPTY = {
  youtubeUrl: '',
  title: '',
  description: '',
  order: 0,
};

// Extractor helper to get YouTube video ID (supports standard, shorts, watch?v=)
function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  try {
    let id = '';
    if (url.includes('youtube.com/shorts/')) {
      id = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    } else if (url.includes('watch?v=')) {
      id = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      id = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
    } else {
      id = url.trim(); // Assume they pasted the ID directly
    }
    return id ? `https://www.youtube.com/embed/${id}` : '';
  } catch {
    return '';
  }
}

export default function ManageVideos() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const load = () => api.get('/videos').then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  function startEdit(v) {
    setEditing(v);
    setForm({
      youtubeUrl: v.youtubeUrl || '',
      title: v.title || '',
      description: v.description || '',
      order: v.order || 0,
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
      youtubeUrl: form.youtubeUrl.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      order: Number(form.order) || 0,
    };
    try {
      if (editing) await api.put(`/videos/${editing._id}`, payload);
      else await api.post('/videos', payload);
      setFlash({ type: 'ok', text: editing ? 'Video updated' : 'Video created' });
      reset();
      load();
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not save' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(v) {
    if (!confirm('Delete this video? This cannot be undone.')) return;
    await api.delete(`/videos/${v._id}`);
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Cinematography" searchPlaceholder="Search videos">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-ink">Cinematography Videos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((v) => {
              const embedUrl = getYoutubeEmbedUrl(v.youtubeUrl);
              return (
                <div key={v._id} className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-lav-200">
                  <div className="aspect-video w-full bg-ink/10">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={v.title}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-red-600 font-semibold">Invalid YouTube Link</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 font-bold text-ink">{v.title || 'Cinematography Highlight'}</h3>
                      <span className="shrink-0 rounded bg-lav-100 px-2 py-0.5 text-xs font-semibold text-ink">
                        Order: {v.order}
                      </span>
                    </div>
                    {v.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{v.description}</p>
                    )}
                    <p className="mt-1 truncate text-[10px] text-ink-muted">{v.youtubeUrl}</p>
                    <div className="mt-4 flex gap-2 border-t border-lav-200 pt-3">
                      <button onClick={() => startEdit(v)} className="rounded-md border border-lav-300 px-3 py-1 text-xs font-semibold text-ink hover:bg-lav-100">
                        Edit
                      </button>
                      <button onClick={() => remove(v)} className="ml-auto text-xs font-semibold text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-ink-muted ring-1 ring-lav-200 sm:col-span-2">
                No videos yet
              </p>
            )}
          </div>
        </div>

        <form onSubmit={save} className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          <h3 className="text-base font-semibold text-ink">{editing ? 'Edit video' : 'New video'}</h3>
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}
          <div>
            <label className="label">Video Title</label>
            <input className="input-field" placeholder="e.g. Wedding Cinematic Highlight" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" placeholder="Video description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div>
            <label className="label">YouTube URL</label>
            <input className="input-field" placeholder="https://www.youtube.com/watch?v=..." value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} required />
          </div>
          <div>
            <label className="label">Display Order</label>
            <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {editing && <button type="button" onClick={reset} className="rounded-md border border-lav-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-lav-100">Cancel</button>}
            <button type="submit" disabled={busy} className="btn-primary w-auto px-4">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create video'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
