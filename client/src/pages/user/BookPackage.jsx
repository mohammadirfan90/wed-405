import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';
import PhoneInput from '../../components/PhoneInput.jsx';

export default function BookPackage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [form, setForm] = useState({
    eventDate: '',
    venue: '',
    guests: 100,
    notes: '',
    // PhoneInput emits the full E.164 string, so start empty.
    contactPhone: '',
    contactEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/packages/${id}`).then(({ data }) => setPkg(data)).catch(() => setError('Package not found'));
  }, [id]);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.eventDate || !form.venue) return setError('Please provide the event date and venue');
    try {
      setSubmitting(true);
      await api.post('/bookings', { ...form, packageId: id });
      navigate('/dashboard/bookings', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell variant="user" title="Book Package" searchPlaceholder="Search">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-semibold text-ink">Book a Package</h2>

        {pkg && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-soft">
            <div className="rounded-full bg-lav-200 px-2 py-0.5 text-xs font-semibold text-ink-muted">
              {pkg.category}
            </div>
            <div className="text-base font-semibold text-ink">{pkg.title}</div>
            <div className="ml-auto text-sm font-bold text-brand">
              {pkg.currency} {pkg.price.toLocaleString()}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-xl bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Event Date</label>
              <input
                type="date"
                className="input-field"
                value={form.eventDate}
                onChange={(e) => update('eventDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Expected Guests</label>
              <input
                type="number" min="1"
                className="input-field"
                value={form.guests}
                onChange={(e) => update('guests', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label">Venue / Location</label>
            <input
              className="input-field"
              value={form.venue}
              onChange={(e) => update('venue', e.target.value)}
              placeholder="e.g. Grand Ballroom, Dhaka"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Contact Phone</label>
              <PhoneInput value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} required />
            </div>
            <div>
              <label className="label">Contact Email <span className="text-ink-muted font-normal">(optional)</span></label>
              <input
                type="email"
                className="input-field"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes <span className="text-ink-muted font-normal">(optional)</span></label>
            <textarea
              rows={4}
              className="input-field"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Tell us about your event, theme, special moments…"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-lav-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-lav-100">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary w-auto px-6">
              {submitting ? 'Submitting…' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
