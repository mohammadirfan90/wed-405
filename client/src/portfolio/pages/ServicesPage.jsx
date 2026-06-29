import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../lib/portfolioApi';

/**
 * ServicesPage — editorial list of photography services.
 * Each service gets a full-width row with image, copy, deliverables list.
 */
export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const revealRef = useRef(null);

  useEffect(() => {
    getServices().then(setServices).catch(() => {});
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
      {/* MASTHEAD ------------------------------------------------- */}
      <section className="relative pt-32 md:pt-44 pb-20">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="pf-eyebrow pf-reveal">The Services · 06</p>
          <h1 className="pf-display mt-6 font-light text-7xl sm:text-8xl md:text-9xl leading-[0.86] tracking-tight pf-reveal pf-reveal-delay-1">
            Six ways we
            <br />
            <span className="italic text-sepia">work</span>.
          </h1>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pf-reveal pf-reveal-delay-2">
            <p className="pf-quote text-xl text-carbon/80">
              Every booking is custom-quoted — these starting points are guides.
              Get in touch for a tailored estimate.
            </p>
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                ['420+', 'Days shot'],
                ['08', 'Years'],
                ['24h', 'Sneak peek'],
                ['100%', 'Print'],
              ].map(([n, l]) => (
                <div key={l} className="border-t border-carbon/20 pt-3">
                  <p className="pf-display text-4xl font-light">{n}</p>
                  <p className="pf-eyebrow !text-carbon/60 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES LIST ------------------------------------------- */}
      <section className="border-t border-carbon/15">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {services.map((s, i) => (
            <article
              key={s._id || i}
              className={[
                'py-16 sm:py-24 grid grid-cols-12 gap-8 items-center pf-reveal',
                i % 2 === 0 ? '' : 'bg-paper-50',
              ].join(' ')}
            >
              {/* index + visual */}
              <div
                className={[
                  'col-span-12 md:col-span-5 relative',
                  i % 2 === 1 ? 'md:order-2' : '',
                ].join(' ')}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-carbon">
                  {s.coverImage ? (
                    <img
                      src={s.coverImage}
                      alt={s.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center pf-eyebrow !text-paper">
                      Service {String(i + 1).padStart(2, '0')}
                    </div>
                  )}
                  <div className="pf-vignette absolute inset-0" aria-hidden />
                  <span className="absolute top-4 left-4 pf-tag !border-paper !text-paper bg-carbon/40 backdrop-blur-sm">
                    0{i + 1} / {services.length}
                  </span>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-sepia text-paper px-4 py-2 pf-display text-xl">
                  {s.duration}
                </div>
              </div>

              {/* copy */}
              <div
                className={[
                  'col-span-12 md:col-span-7 space-y-6',
                  i % 2 === 1 ? 'md:order-1 md:pr-12' : 'md:pl-12',
                ].join(' ')}
              >
                <p className="pf-eyebrow !text-sepia">{s.category}</p>
                <h2 className="pf-display text-5xl sm:text-6xl font-light leading-[0.95]">
                  {s.title}
                </h2>
                {s.summary && (
                  <p className="text-lg text-carbon/75 leading-relaxed max-w-xl">{s.summary}</p>
                )}
                {s.deliverables?.length > 0 && (
                  <div>
                    <p className="pf-eyebrow !text-carbon/60">What you receive</p>
                    <ul className="mt-3 space-y-2 max-w-md">
                      {s.deliverables.map((d, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm text-carbon/85 leading-relaxed"
                        >
                          <span className="mt-1.5 inline-block w-1.5 h-1.5 bg-sepia rotate-45 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.startingFrom && (
                  <div className="flex items-baseline gap-3 pt-3 border-t border-carbon/15">
                    <span className="pf-display text-4xl font-light">
                      ৳ {Number(s.startingFrom).toLocaleString('en-IN')}
                    </span>
                    <span className="pf-eyebrow !text-carbon/55">Starting from</span>
                  </div>
                )}
                <div className="pt-2">
                  <Link
                    to={`/portfolio/book?service=${encodeURIComponent(s.title)}`}
                    className="pf-link"
                  >
                    Book this service →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ADD-ONS -------------------------------------------------- */}
      <section className="py-24 sm:py-32 bg-paper-50 border-t border-carbon/15">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pf-reveal">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <p className="pf-eyebrow">Add-Ons · À la carte</p>
              <h2 className="pf-display mt-3 text-5xl font-light">
                Make it <span className="italic">yours</span>.
              </h2>
              <p className="mt-6 text-carbon/70 leading-relaxed">
                Build a custom package from any combination of these à la carte services.
                Pricing is per-event and varies with travel and crew size.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-carbon/15">
              {[
                ['Second Photographer', '৳ 800 / day'],
                ['Drone Aerial Coverage', '৳ 600 / hour'],
                ['Album Heirloom Book', '৳ 450'],
                ['Engagement / Holud Reel', '৳ 900'],
                ['Extra 4K Film', '৳ 1,200'],
                ['Same-Day Edit Reel', '৳ 1,800'],
                ['Studio Portrait Session', '৳ 700'],
                ['Travel Outside Dhaka', '৳ 350 / day'],
              ].map(([t, p]) => (
                <div key={t} className="bg-paper-50 p-5 flex items-baseline justify-between gap-4">
                  <span className="pf-display text-lg">{t}</span>
                  <span className="text-sm text-carbon/65 whitespace-nowrap">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA ------------------------------------------------------ */}
      <section className="py-24 sm:py-32 bg-carbon text-paper relative overflow-hidden">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center pf-reveal">
          <p className="pf-eyebrow !text-sepia">Step One</p>
          <h2 className="pf-display mt-4 text-5xl sm:text-6xl font-light leading-tight">
            Reserve your date.
          </h2>
          <p className="mt-6 text-paper/70 max-w-xl mx-auto">
            Twenty per cent secures the slot. The rest is due a week before the day.
          </p>
          <Link
            to="/portfolio/book"
            className="pf-btn inline-flex mt-8 !bg-paper !text-carbon hover:!bg-sepia hover:!text-paper"
          >
            Open the Booking Form →
          </Link>
        </div>
      </section>
    </main>
  );
}
