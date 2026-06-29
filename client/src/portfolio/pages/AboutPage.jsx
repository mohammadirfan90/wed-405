import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAbout } from '../lib/portfolioApi';

/**
 * AboutPage — editorial magazine spread.
 * Big serif headline → photographer bio with portrait → philosophy numbers
 * → team grid → pull-quote → CTA.
 */
export default function AboutPage() {
  const [about, setAbout] = useState({ story: null, team: [], settings: {} });
  const revealRef = useRef(null);

  useEffect(() => {
    getAbout().then(setAbout).catch(() => {});
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

  const story = about.story || {};
  const heroImage = story.images?.[0] || story.image;

  return (
    <main ref={revealRef} className="pf-root pf-paper">
      {/* MASTHEAD ------------------------------------------------- */}
      <section className="relative pt-32 md:pt-44 pb-16">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-9 pf-reveal">
              <p className="pf-eyebrow">About the Studio · Est. 2017</p>
              <h1 className="pf-display mt-6 font-light text-[14vw] sm:text-7xl md:text-[10rem] lg:text-[12rem] leading-[0.86] tracking-tight">
                A small
                <br />
                <span className="italic text-sepia">quiet</span> studio.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-3 pf-reveal pf-reveal-delay-2">
              <div className="pf-rule-thick w-12 mb-4" />
              <p className="pf-eyebrow !text-carbon/70">Index</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>↳ A letter from the founder</li>
                <li>↳ The team</li>
                <li>↳ How we work</li>
                <li>↳ Press & features</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LETTER --------------------------------------------------- */}
      <section className="border-y border-carbon/15 py-24 sm:py-32 bg-paper-50">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 pf-reveal">
          <p className="pf-eyebrow">A Letter</p>
          <p className="mt-8 pf-quote text-3xl sm:text-4xl md:text-5xl leading-tight">
            {story.headline ||
              'We started Chronos in a tiny flat in Old Dhaka, with one camera and a borrowed lens.'}
          </p>
          <div className="mt-10 space-y-5 text-lg text-carbon/85 leading-relaxed">
            {story.body && <p>{story.body}</p>}
            {!story.body && (
              <>
                <p>
                  The name is the Greek word for time. We chose it because weddings, like
                  photographs, are about choosing which seconds to keep. We make pictures for
                  the seconds you almost didn't notice — the light through a window, a hand
                  resting on a shoulder, the silence between two toasts.
                </p>
                <p>
                  Eight years on, we're still small on purpose. Aamir shoots most days; Marium
                  handles studio, post-production, and the all-important second-cam coverage.
                  We work in colour and in black-and-white. We work in film and digital. We
                  print everything we shoot, because a photograph that lives only on a phone
                  is a half-finished thought.
                </p>
                <p>
                  If you're reading this and planning something, we'd love to hear from you.
                </p>
              </>
            )}
            <p className="pf-display text-2xl italic mt-8">— Aamir & Marium</p>
          </div>
        </div>
      </section>

      {/* TEAM ----------------------------------------------------- */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-16 pf-reveal">
            <p className="pf-eyebrow">The Team · Four</p>
            <h2 className="pf-display mt-3 text-5xl sm:text-6xl font-light">
              The hands behind <span className="italic">the frames</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 pf-reveal">
            {about.team.map((m, i) => (
              <article key={m._id || i} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-carbon">
                  {m.image && (
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  )}
                  <div className="pf-vignette absolute inset-0" aria-hidden />
                  <span className="absolute top-3 left-3 pf-tag !border-paper/60 !text-paper bg-carbon/30 backdrop-blur-sm">
                    0{i + 1}
                  </span>
                </div>
                <div className="pt-5">
                  <h3 className="pf-display text-2xl">{m.name}</h3>
                  <p className="mt-1 pf-eyebrow !text-sepia">{m.role}</p>
                  {m.bio && (
                    <p className="mt-3 text-sm text-carbon/75 leading-relaxed">{m.bio}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY NUMBERS -------------------------------------- */}
      <section className="py-24 sm:py-32 bg-carbon text-paper relative overflow-hidden">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pf-reveal">
          <p className="pf-eyebrow !text-sepia">The Practice</p>
          <h2 className="pf-display mt-3 text-5xl sm:text-6xl font-light">
            How we <span className="italic">work</span>
          </h2>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              ['08', 'Years of practice', 'Two founders, one shared vision.'],
              ['420+', 'Days documented', 'From intimate 40-guest dinners to 800-strong weddings.'],
              ['24h', 'Sneak-peek turnaround', 'Twelve frames, edited in our signature look.'],
              ['100%', 'Printed keepsakes', 'Every booked package includes a heirloom print box.'],
            ].map(([n, label, sub]) => (
              <div key={label} className="border-t border-paper/20 pt-5">
                <p className="pf-counter text-6xl md:text-7xl font-light text-paper">{n}</p>
                <p className="pf-eyebrow !text-sepia mt-3">{label}</p>
                <p className="mt-2 text-sm text-paper/65 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PULL-QUOTE ----------------------------------------------- */}
      <section className="py-24 sm:py-32 bg-paper-50">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pf-reveal">
          <p className="pf-eyebrow text-center">From the field</p>
          <p className="mt-8 pf-quote text-3xl sm:text-4xl md:text-5xl text-center leading-tight">
            “The best photographs are the ones that don't try to be photographs — they're
            just people being themselves in good light.”
          </p>
          <p className="mt-8 text-center pf-eyebrow !text-carbon/60">
            — Aamir Chowdhury, Founder
          </p>
        </div>
      </section>

      {/* CTA ------------------------------------------------------ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center pf-reveal">
          <p className="pf-eyebrow">Now Booking</p>
          <h2 className="pf-display mt-4 text-5xl sm:text-6xl font-light leading-tight">
            Let's talk about your day.
          </h2>
          <p className="mt-6 text-carbon/70 max-w-xl mx-auto">
            We take on a limited number of weddings each year to keep our work close and our
            weekends free.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/portfolio/book" className="pf-btn">
              Reserve a Date →
            </Link>
            <Link to="/portfolio/gallery" className="pf-btn pf-btn-ghost">
              See the Work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
