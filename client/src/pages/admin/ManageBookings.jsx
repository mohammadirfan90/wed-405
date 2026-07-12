import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';
import Modal from '../../components/Modal.jsx';

const STATUS = ['pending', 'approved', 'declined', 'completed', 'cancelled'];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Google Drive delivery modal states
  const [completionBooking, setCompletionBooking] = useState(null);
  const [driveLinkInput, setDriveLinkInput] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/bookings', { params: filter ? { status: filter } : {} })
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  async function update(id, status, googleDriveLink) {
    const payload = { status };
    if (googleDriveLink !== undefined) payload.googleDriveLink = googleDriveLink;
    await api.patch(`/bookings/${id}`, payload);
    load();
    setCompletionBooking(null);
  }

  function handleOpenDeliveryModal(booking) {
    setCompletionBooking(booking);
    setDriveLinkInput(booking.googleDriveLink || '');
  }

  function handleSaveDelivery(e) {
    e.preventDefault();
    if (!completionBooking) return;
    // Mark as completed (or update link) and save the link
    update(completionBooking._id, completionBooking.status === 'completed' ? 'completed' : 'completed', driveLinkInput);
  }

  return (
    <DashboardShell variant="admin" title="Manage Bookings" searchPlaceholder="Search bookings">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-charcoal">Manage Bookings</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('')} className={'rounded-full px-3 py-1 text-xs font-semibold ' + (!filter ? 'bg-charcoal text-gold' : 'bg-white text-charcoal/70 border border-taupe/30')}>All</button>
          {STATUS.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (filter === s ? 'bg-charcoal text-gold' : 'bg-white text-charcoal/70 border border-taupe/30')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-taupe/10 text-left text-xs uppercase text-charcoal/70">
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
              <tr key={b._id} className="border-t border-taupe/20">
                <td className="px-4 py-3">
                  <div className="font-semibold text-charcoal">
                    {b.user?.name || 'Guest'} {!b.user && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 ml-1">Guest</span>}
                  </div>
                  <div className="text-xs text-charcoal/70">
                    {b.user?.phone || b.contactPhone || ''}
                    {(!b.user && b.contactEmail) && ` · ${b.contactEmail}`}
                  </div>
                  <div className="text-[11px] text-[#D4AF37] font-mono font-bold uppercase mt-0.5">
                    ID: {b.bookingId || '—'}
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal">{b.package?.title || '—'}</td>
                <td className="px-4 py-3 text-charcoal/70">{new Date(b.eventDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-charcoal/70">{b.venue}</td>
                <td className="px-4 py-3 capitalize text-charcoal/70">
                  <span className="font-semibold">{b.status}</span>
                  {b.googleDriveLink && (
                    <div className="text-[10px] text-blue-600 truncate max-w-[150px]" title={b.googleDriveLink}>
                      🔗 Drive set
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {b.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => update(b._id, 'approved')} className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                      <button onClick={() => update(b._id, 'declined')} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700">Decline</button>
                    </div>
                  )}
                  {b.status === 'approved' && (
                    <button onClick={() => handleOpenDeliveryModal(b)} className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700">Mark complete</button>
                  )}
                  {b.status === 'completed' && (
                    <div className="flex justify-end gap-2 items-center">
                      {b.googleDriveLink && (
                        <a href={b.googleDriveLink} target="_blank" rel="noreferrer" className="rounded-md bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100" title="Go to Drive Link">
                          View Drive
                        </a>
                      )}
                      <button onClick={() => handleOpenDeliveryModal(b)} className="rounded-md bg-gray-500 px-2 py-1 text-xs font-semibold text-white hover:bg-gray-600">
                        Edit Link
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-charcoal/70">No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Google Drive Delivery Modal */}
      <Modal
        open={!!completionBooking}
        onClose={() => setCompletionBooking(null)}
        title={completionBooking?.status === 'completed' ? "Edit Delivery Link" : "Deliver Photos & Videos"}
      >
        <form onSubmit={handleSaveDelivery} className="space-y-4">
          <p className="text-sm text-charcoal/70">
            Please provide the Google Drive link containing the photos and videos for booking <strong>{completionBooking?.bookingId}</strong>.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-charcoal/60 mb-1">Google Drive Link</label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveLinkInput}
              onChange={(e) => setDriveLinkInput(e.target.value)}
              className="w-full rounded-lg border border-taupe/30 px-3 py-2 text-sm text-charcoal outline-none focus:border-gold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCompletionBooking(null)}
              className="rounded-md border border-taupe/30 px-3 py-1.5 text-xs font-semibold text-charcoal/70 hover:bg-lav-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-charcoal text-gold px-4 py-1.5 text-xs font-bold hover:opacity-90"
            >
              {completionBooking?.status === 'completed' ? "Update Link" : "Submit & Mark Complete"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
