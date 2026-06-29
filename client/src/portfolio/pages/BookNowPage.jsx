import { useEffect, useRef, useState } from 'react';
import BookingForm from '../components/BookingForm';
import { getSettings } from '../lib/portfolioApi';

/**
 * BookNowPage — split-screen editorial layout.
 * Left column: parchment backdrop, pull-quote, studio meta, marquee.
 * Right column: the BookingForm.
 */
export default function BookNowPage() {
  const [settings, setSettings] = useState({});
  const revealRef = useRef(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('pf-in', e.isIntersecting)),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    el.querySelectorAll('.pf-reveal').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <main ref={revealRef} className="pf-root pf-paper">
      <section className="relative pt-28 md:pt-32 pb-20">
        <div className="pf-grain" aria-hidden />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* LEFT ---------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-10 pf-reveal">
              <div>
                <p className="pf-eyebrow">Booking · Step One</p>
                <h1 className="pf-display mt-6 font-light text-6xl sm:text-7xl leading-[0.92] tracking-tight">
                  Reserve
                  <br />
                  <span className="italic text-sepia">the date</span>.
                </h1>
              </div>

              <p className="pf-quote text-2xl text-carbon/85 leading-snug">
                “We don't book more than 36 weddings a year — each one gets our full attention,
                full team, and full heart.”
              </p>

              <div className="pf-rule" />

              {/* Studio meta */}
              <dl className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-3">
                  <dt className="pf-eyebrow !text-carbon/60">Studio</dt>
                  <dd className="col-span-2 text-carbon/85">
                    {settings.contact_address || 'House 12, Road 7, Banani, Dhaka'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <dt className="pf-eyebrow !text-carbon/60">Phone</dt>
                  <dd className="col-span-2">
                    {settings.contact_phone ? (
                      <a
                        href={`tel:${settings.contact_phone}`}
                        className="text-carbon hover:text-sepia transition"
                      >
                        {settings.contact_phone}
                      </a>
                    ) : (
                      '+880 1327-292323'
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <dt className="pf-eyebrow !text-carbon/60">Email</dt>
                  <dd className="col-span-2">
                    {settings.contact_email ? (
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="text-carbon hover:text-sepia transition break-all"
                      >
                        {settings.contact_email}
                      </a>
                    ) : (
                      'hello@chronos-moments.com'
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <dt className="pf-eyebrow !text-carbon/60">Hours</dt>
                  <dd className="col-span-2 text-carbon/85">
                    Tue – Sat, 11 a.m. to 7 p.m.
                    <br />
                    <span className="text-carbon/60">Studio visits by appointment only</span>
                  </dd>
                </div>
              </dl>

              <div className="pf-rule" />

              {/* Process steps */}
              <div>
                <p className="pf-eyebrow !text-carbon/60">How it works</p>
                <ol className="mt-4 space-y-5">
                  {[
                    ['01', 'Reserve', 'Send the form on the right — 20% secures the slot.'],
                    ['02', 'Meet', 'A studio visit or video call within two weeks of reserving.'],
                    ['03', 'Plan', 'Two consultations, mood-boards, a shot-list, and a timeline.'],
                    ['04', 'Shoot', 'The day itself. We arrive an hour early. We stay late.'],
                    ['05', 'Deliver', 'Sneak peek in 24 hours. Full gallery in 4–6 weeks.'],
                  ].map(([n, t, blurb]) => (
                    <li key={n} className="grid grid-cols-12 gap-3 items-start">
                      <span className="col-span-2 pf-display text-3xl text-sepia">{n}</span>
                      <div className="col-span-10">
                        <p className="pf-display text-xl">{t}</p>
                        <p className="text-sm text-carbon/70 leading-relaxed">{blurb}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* RIGHT — FORM ------------------------------------------- */}
            <div className="lg:col-span-7 pf-reveal pf-reveal-delay-1">
              <div className="lg:sticky lg:top-28">
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
