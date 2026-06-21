import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-emerald-100 text-emerald-800',
  declined:  'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-200 text-gray-700',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function cancel(id) {
    if (!confirm('Cancel this booking request?')) return;
    await api.patch(`/bookings/${id}/cancel`);
    load();
  }

  return (
    <DashboardShell variant="user" title="My Bookings" searchPlaceholder="Search bookings">
      <h2 className="mb-4 text-xl font-semibold text-ink">My Bookings</h2>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-sm text-ink-muted shadow-soft">
          You haven&apos;t made any booking requests yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-lav-100 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Event Date</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-t border-lav-200">
                  <td className="px-4 py-3 font-semibold text-ink">{b.package?.title || '—'}</td>
                  <td className="px-4 py-3 text-ink-muted">{new Date(b.eventDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-ink-muted">{b.venue}</td>
                  <td className="px-4 py-3">
                    <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + (STATUS_STYLES[b.status] || '')}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {b.status === 'pending' && (
                      <button onClick={() => cancel(b._id)} className="text-xs font-semibold text-red-600 hover:underline">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
