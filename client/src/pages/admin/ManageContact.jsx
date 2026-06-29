import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

function formatDate(d) {
  return new Date(d).toLocaleString();
}

// Derive a virtual "status" string from the boolean isRead so the UI can
// filter by it. The backend only stores `isRead` (boolean) + `readAt`.
function virtualStatus(m) {
  return m.isRead ? 'read' : 'new';
}

export default function ManageContact() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [flash, setFlash] = useState(null);

  const load = () => api.get('/contact').then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      if (filter !== 'all' && virtualStatus(m) !== filter) return false;
      if (!q) return true;
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  async function setRead(m, isRead) {
    await api.patch(`/contact/${m._id}/status`, { status: isRead ? 'read' : 'unread' });
    setFlash({ type: 'ok', text: isRead ? `Marked ${m.name} as read` : `Marked ${m.name} as unread` });
    load();
    if (active?._id === m._id) setActive((a) => ({ ...a, isRead, readAt: isRead ? new Date() : null }));
  }
  async function remove(m) {
    if (!confirm(`Delete message from ${m.name}? This cannot be undone.`)) return;
    await api.delete(`/contact/${m._id}`);
    setFlash({ type: 'ok', text: 'Message deleted' });
    if (active?._id === m._id) setActive(null);
    load();
  }

  const counts = useMemo(() => {
    return items.reduce(
      (acc, m) => {
        const s = virtualStatus(m);
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { new: 0, read: 0 }
    );
  }, [items]);

  return (
    <DashboardShell variant="admin" title="Contact Inbox" searchPlaceholder="Search messages">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Contact Inbox</h2>
          <p className="text-sm text-ink-muted">
            {items.length} total · {counts.new} new · {counts.read} read
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name/email/subject…"
            className="input-field w-64"
          />
          <div className="flex gap-1">
            {['all', 'new', 'read'].map((s) => (
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
      </div>

      {flash && (
        <p className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{flash.text}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <div className="space-y-2">
          {filtered.map((m) => {
            const isUnread = !m.isRead;
            return (
              <button
                key={m._id}
                onClick={() => {
                  setActive(m);
                  if (isUnread) setRead(m, true);
                }}
                className={
                  'block w-full rounded-xl border p-4 text-left transition ' +
                  (active?._id === m._id
                    ? 'border-brand bg-brand/5'
                    : 'border-lav-200 bg-white hover:border-brand/50')
                }
              >
                <div className="flex items-center justify-between">
                  <span className={'font-semibold text-ink' + (isUnread ? ' underline decoration-brand decoration-2 underline-offset-2' : '')}>
                    {m.name}
                  </span>
                  <span
                    className={
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ' +
                      (isUnread ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700')
                    }
                  >
                    {isUnread ? 'new' : 'read'}
                  </span>
                </div>
                <div className="text-xs text-ink-muted">{m.email} · {m.phone || '—'}</div>
                <div className="mt-1 truncate text-sm text-ink">{m.subject || '(no subject)'}</div>
                <div className="mt-1 text-[10px] text-ink-muted">{formatDate(m.createdAt)}</div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-ink-muted ring-1 ring-lav-200">No messages</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-lav-200">
          {active ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{active.subject || '(no subject)'}</h3>
                  <p className="text-sm text-ink-muted">
                    From <span className="font-semibold text-ink">{active.name}</span> · {active.email} · {active.phone || '—'}
                  </p>
                  <p className="text-xs text-ink-muted">Received {formatDate(active.createdAt)}</p>
                  {active.isRead && active.readAt && (
                    <p className="text-xs text-ink-muted">Read {formatDate(active.readAt)}</p>
                  )}
                </div>
                <span
                  className={
                    'rounded-full px-2 py-1 text-[10px] font-semibold uppercase ' +
                    (active.isRead ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-800')
                  }
                >
                  {active.isRead ? 'read' : 'new'}
                </span>
              </div>
              <p className="whitespace-pre-wrap rounded-md bg-lav-50 p-4 text-sm text-ink">{active.message}</p>
              <div className="flex flex-wrap gap-2 border-t border-lav-200 pt-4">
                {active.isRead ? (
                  <button onClick={() => setRead(active, false)} className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                    Mark unread
                  </button>
                ) : (
                  <button onClick={() => setRead(active, true)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                    Mark read
                  </button>
                )}
                <a
                  href={`mailto:${active.email}?subject=${encodeURIComponent('Re: ' + (active.subject || 'Your enquiry'))}`}
                  className="rounded-md border border-brand bg-white px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5"
                >
                  Reply by email
                </a>
                <button onClick={() => remove(active)} className="ml-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-ink-muted">Select a message to read it</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}