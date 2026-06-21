import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const EMPTY = {
  packageId: '',
  eventDate: '',
  venue: '',
  guests: 50,
  contactPhone: '',
  contactEmail: '',
  notes: '',
};

function todayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function money(n) {
  if (n == null || isNaN(n)) return '—';
  return 'BDT ' + Number(n).toLocaleString('en-IN');
}

export default function BookNowModal({ onClose, prefillPackageId }) {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [form, setForm] = useState({
    ...EMPTY,
    packageId: prefillPackageId || '',
    eventDate: todayISO(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/packages')
      .then(({ data }) => { if (!cancelled) setPackages(data); })
      .catch(() => { if (!cancelled) setPackages([]); })
      .finally(() => { if (!cancelled) setLoadingPkgs(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedPkg = useMemo(
    () => packages.find((p) => p._id === form.packageId) || null,
    [packages, form.packageId]
  );

  const total = selectedPkg?.price || 0;
  const advance = Math.round(total * 0.2);
  const balance = total - advance;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!form.packageId) return setError('Please select a package');
    if (!form.eventDate) return setError('Please pick an event date');
    if (!form.venue.trim()) return setError('Please enter the venue');
    if (!form.contactPhone.trim()) return setError('Please enter a contact phone');
    setBusy(true);
    try {
      const { data } = await api.post('/bookings', {
        package: form.packageId,
        eventDate: form.eventDate,
        venue: form.venue.trim(),
        guests: Number(form.guests) || undefined,
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim() || undefined,
        notes: form.notes.trim(),
      });
      setSuccess(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create booking');
    } finally {
      setBusy(false);
    }
  }

  function goToBookings() {
    onClose();
    navigate('/dashboard/bookings');
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-lav-200">
        <header className="flex items-center justify-between border-b border-lav-200 bg-lav-100/60 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Book your event</h2>
            <p className="text-xs text-ink-muted">A 20% advance secures your date.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted hover:bg-lav-200 hover:text-ink"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {success ? (
          <div className="space-y-4 p-6 text-sm text-ink">
            <div className="rounded-md bg-emerald-50 p-4 text-emerald-800">
              <div className="font-semibold">Booking received</div>
              <div className="mt-1 text-xs">
                Reference <span className="font-mono">{success._id}</span> · status: {success.status}
              </div>
            </div>
            <div className="rounded-md bg-lav-100/60 p-4 text-xs text-ink">
              <div className="font-semibold text-ink">Payment summary</div>
              <div className="mt-2 grid grid-cols-2 gap-1">
                <span>Total</span><span className="text-right">{money(total)}</span>
                <span>Advance due (20%)</span><span className="text-right font-semibold">{money(advance)}</span>
                <span>Balance at event</span><span className="text-right">{money(balance)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-md border border-lav-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-lav-100">
                Close
              </button>
              <button type="button" onClick={goToBookings} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                View my bookings
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 p-6 md:grid-cols-2">
            {/* Package selection */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink">Package</label>
              {loadingPkgs ? (
                <p className="text-sm text-ink-muted">Loading packages…</p>
              ) : packages.length === 0 ? (
                <p className="text-sm text-red-600">No packages available right now.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {packages.map((p) => {
                    const active = form.packageId === p._id;
                    return (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => set('packageId', p._id)}
                        className={
                          'rounded-lg border p-3 text-left transition ' +
                          (active
                            ? 'border-brand bg-brand/5 ring-2 ring-brand/30'
                            : 'border-lav-200 hover:border-lav-300 hover:bg-lav-100/50')
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-ink">{p.title}</span>
                          <span className="text-sm font-bold text-brand">{money(p.price)}</span>
                        </div>
                        {p.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{p.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Event date</label>
              <input
                type="date"
                className="input-field"
                value={form.eventDate}
                min={todayISO()}
                onChange={(e) => set('eventDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Guests</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.guests}
                onChange={(e) => set('guests', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink">Venue</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Lakeside Resort, Banani"
                value={form.venue}
                onChange={(e) => set('venue', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Contact phone (E.164, e.g. +8801XXXXXXXXX)</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+8801712345678"
                value={form.contactPhone}
                onChange={(e) => set('contactPhone', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Contact email (optional)</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink">Notes</label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="Theme preferences, special moments, etc."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>

            {/* Payment summary */}
            <div className="md:col-span-2 rounded-lg border border-lav-200 bg-lav-100/60 p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Payment summary</div>
              <div className="grid grid-cols-2 gap-y-1">
                <span>Package</span>
                <span className="text-right font-medium text-ink">{selectedPkg?.title || '—'}</span>
                <span>Total</span>
                <span className="text-right">{money(total)}</span>
                <span className="font-semibold text-ink">Advance due now (20%)</span>
                <span className="text-right font-semibold text-brand">{money(advance)}</span>
                <span>Balance at event</span>
                <span className="text-right">{money(balance)}</span>
              </div>
            </div>

            {error && (
              <div className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="md:col-span-2 flex items-center justify-between">
              <p className="text-xs text-ink-muted">
                Pay 20% advance to confirm. Remaining balance due on event day.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-lav-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-lav-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !selectedPkg}
                  className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-600 disabled:opacity-60"
                >
                  {busy ? 'Submitting…' : `Pay ${money(advance)} advance`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
