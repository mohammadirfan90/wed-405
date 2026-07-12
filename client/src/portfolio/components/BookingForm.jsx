import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createBooking, getPackages, getSettings } from '../lib/portfolioApi';

/**
 * BookingForm — a multi-field intake with validation, package
 * pre-selection, and a WhatsApp redirect on success.
 *
 * Props:
 *   - onSuccess(booking)    — optional callback after POST
 *   - embedded             — visual variant for inline use
 *   - compact              — compact variant for sidebar
 */
function todayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function money(n, currency = 'BDT') {
  if (n == null || isNaN(n)) return '—';
  const sym = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '';
  return `${sym} ${Number(n).toLocaleString('en-IN')}`;
}

export default function BookingForm({ onSuccess, embedded = false, compact = false }) {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('package') || '';

  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: todayISO(),
    venue: '',
    guests: 120,
    packageId: preselected,
    notes: '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getPackages().then(setPackages).catch(() => {});
    getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, packageId: preselected }));
  }, [preselected]);

  const selectedPackage = useMemo(
    () => packages.find((p) => p._id === form.packageId) || null,
    [packages, form.packageId],
  );

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError('Please tell us your name.');
    if (!form.phone.trim()) return setError('A contact phone is required.');
    if (!form.packageId) return setError('Please pick a package.');
    if (!form.eventDate) return setError('Please choose an event date.');
    if (!form.venue.trim()) return setError('Where will the day take place?');

    // Phone must be in E.164 — auto-stitch leading 0 → +880
    let phone = form.phone.trim().replace(/[\s-]/g, '');
    if (/^0\d{10}$/.test(phone)) phone = '+88' + phone;
    if (!/^\+[1-9]\d{6,14}$/.test(phone))
      return setError('Phone must be in international format, e.g. +8801712345678');

    setBusy(true);
    try {
      const payload = {
        package: form.packageId,
        eventDate: form.eventDate,
        venue: form.venue.trim(),
        guests: Number(form.guests) || undefined,
        contactPhone: phone,
        contactEmail: form.email.trim() || undefined,
        notes: [
          form.name.trim() && `Lead: ${form.name.trim()}`,
          form.notes.trim() && `Notes: ${form.notes.trim()}`,
        ]
          .filter(Boolean)
          .join(' — '),
      };
      const data = await createBooking(payload);
      setSuccess(data);
      onSuccess && onSuccess(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          'Could not save booking — please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  function sendToWhatsapp() {
    if (!success) return;
    const pkg = packages.find((p) => p._id === success.package) || selectedPackage || {};
    const date = new Date(success.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const text = `Hello BiyeBuzz.com,

I would like to confirm my booking request.

*Booking details:*
• Reference: ${success.bookingId || success._id}
• Package: ${pkg.title || 'Selected package'}
• Date: ${date}
• Venue: ${success.venue}
• Guests: ${success.guests || 'N/A'}
• Phone: ${success.contactPhone}
• Email: ${success.contactEmail || 'N/A'}
• Notes: ${success.notes || 'None'}

Please share the advance payment details. Thank you!`;

    const waPhone = (settings.whatsapp_number || '+8801327292323').replace(/[^\d]/g, '');
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  function reset() {
    setSuccess(null);
    setForm({
      name: '',
      phone: '',
      email: '',
      eventDate: todayISO(),
      venue: '',
      guests: 120,
      packageId: '',
      notes: '',
    });
  }

  if (success) {
    const pkg = packages.find((p) => p._id === success.package) || selectedPackage || {};
    const total = pkg.price || 0;
    const advance = Math.round(total * 0.2);

    return (
      <div
        className={[
          'border border-carbon/15 bg-paper-50',
          compact ? 'p-5' : 'p-7 sm:p-9',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 grid place-items-center bg-sepia text-paper">✓</div>
          <div>
            <p className="pf-eyebrow">Booking Confirmed</p>
            <h3 className="pf-display text-2xl font-bold font-mono">Reference {success.bookingId || success._id?.slice(-6).toUpperCase()}</h3>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-carbon/10 pb-2">
            <span className="text-carbon/70">Package</span>
            <span className="pf-display text-lg">{pkg.title || 'Selected package'}</span>
          </div>
          <div className="flex justify-between border-b border-carbon/10 pb-2">
            <span className="text-carbon/70">Date</span>
            <span>
              {new Date(success.eventDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between border-b border-carbon/10 pb-2">
            <span className="text-carbon/70">Venue</span>
            <span className="text-right max-w-[60%]">{success.venue}</span>
          </div>
          <div className="flex justify-between pt-3 pf-display text-2xl">
            <span>Total</span>
            <span>{money(total, pkg.currency)}</span>
          </div>
          <div className="flex justify-between text-sepia pf-display text-xl">
            <span>Advance (20%)</span>
            <span>{money(advance, pkg.currency)}</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-carbon/70 leading-relaxed">
          We've held your slot. To lock the date, send the booking details to our studio
          on WhatsApp — we'll reply with payment directions within an hour.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={sendToWhatsapp} className="pf-btn flex-1">
            Send via WhatsApp →
          </button>
          <button type="button" onClick={reset} className="pf-btn pf-btn-ghost flex-1">
            New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        'bg-paper-50 border border-carbon/15',
        compact ? 'p-5' : 'p-7 sm:p-9',
      ].join(' ')}
    >
      <div className="mb-6">
        <p className="pf-eyebrow">Book Your Day</p>
        <h3 className={['pf-display font-light', compact ? 'text-2xl' : 'text-3xl sm:text-4xl'].join(' ')}>
          Tell us about the day.
        </h3>
        <div className="pf-rule mt-4" />
      </div>

      {error && (
        <div className="mb-5 border-l-2 border-sepia bg-sepia/5 px-4 py-3 text-sm text-carbon">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="pf-label">Your Name</label>
          <input
            type="text"
            className="pf-input"
            placeholder="e.g. Aisha & Rohan"
            value={form.name}
            onChange={update('name')}
            required
          />
        </div>
        <div>
          <label className="pf-label">Contact Phone</label>
          <input
            type="tel"
            className="pf-input"
            placeholder="+880 1XXX-XXXXXX"
            value={form.phone}
            onChange={update('phone')}
            required
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="pf-label">Email (optional)</label>
        <input
          type="email"
          className="pf-input"
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
        />
      </div>

      <div className="mt-5">
        <label className="pf-label">Package</label>
        <select
          className="pf-input"
          value={form.packageId}
          onChange={update('packageId')}
          required
        >
          <option value="">— Choose a package —</option>
          {packages.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title} — {money(p.price, p.currency)}
            </option>
          ))}
        </select>
        {selectedPackage && (
          <p className="mt-2 text-[11px] font-mono uppercase tracking-[0.18em] text-carbon/60">
            {selectedPackage.duration} · 20% advance: {money(selectedPackage.price * 0.2, selectedPackage.currency)}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="pf-label">Event Date</label>
          <input
            type="date"
            className="pf-input"
            value={form.eventDate}
            min={todayISO()}
            onChange={update('eventDate')}
            required
          />
        </div>
        <div>
          <label className="pf-label">Estimated Guests</label>
          <input
            type="number"
            min="1"
            className="pf-input"
            value={form.guests}
            onChange={update('guests')}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="pf-label">Venue / City</label>
        <input
          type="text"
          className="pf-input"
          placeholder="e.g. Sena Malancha, Dhaka Cantt."
          value={form.venue}
          onChange={update('venue')}
          required
        />
      </div>

      <div className="mt-5">
        <label className="pf-label">Notes & Special Directions</label>
        <textarea
          rows={compact ? 2 : 3}
          className="pf-input resize-none"
          placeholder="Theme, mood-board references, family traditions, anything we should know."
          value={form.notes}
          onChange={update('notes')}
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-carbon/55">
          Submitting reserves your date — pay 20% to confirm.
        </p>
        <button type="submit" disabled={busy} className="pf-btn sm:w-auto w-full">
          {busy ? 'Saving…' : 'Reserve the Date →'}
        </button>
      </div>
    </form>
  );
}
