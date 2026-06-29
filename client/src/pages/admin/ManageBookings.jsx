import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const STATUS = ['pending', 'approved', 'declined', 'completed', 'cancelled'];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/bookings', { params: filter ? { status: filter } : {} })
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [filter]);

  async function update(id, status) {
    await api.patch(`/bookings/${id}`, { status });
    load();
  }

  return (
    <DashboardShell variant="admin" title="Manage Bookings" searchPlaceholder="Search bookings">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Manage Bookings</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('')} className={'rounded-full px-3 py-1 text-xs font-semibold ' + (!filter ? 'bg-brand text-white' : 'bg-white text-ink-muted border border-lav-300')}>All</button>
          {STATUS.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (filter === s ? 'bg-brand text-white' : 'bg-white text-ink-muted border border-lav-300')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-lav-100 text-left text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-lav-200">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">
                    {b.user?.name || 'Guest'} {!b.user && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 ml-1">Guest</span>}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {b.user?.phone || b.contactPhone || ''}
                    {(!b.user && b.contactEmail) && ` · ${b.contactEmail}`}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink">{b.package?.title || '—'}</td>
                <td className="px-4 py-3 text-ink-muted">{new Date(b.eventDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-ink-muted">{b.venue}</td>
                <td className="px-4 py-3 capitalize text-ink-muted">{b.status}</td>
                <td className="px-4 py-3 text-right">
                  {b.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => update(b._id, 'approved')} className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                      <button onClick={() => update(b._id, 'declined')} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700">Decline</button>
                    </div>
                  )}
                  {b.status === 'approved' && (
                    <button onClick={() => update(b._id, 'completed')} className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700">Mark complete</button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-muted">No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
