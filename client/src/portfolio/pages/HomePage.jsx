import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHome, getGallery, getPackages } from '../lib/portfolioApi';
import GalleryCard from '../components/GalleryCard';
import PackageCard from '../components/PackageCard';

/**
 * HomePage — editorial cover.
 * Hero (oversized serif headline + film-strip) → intro from /api/home →
 * featured services strip → featured portfolio (4 items) → packages teaser
 * (3 items) → marquee → testimonials → final CTA.
 */
export default function HomePage() {
  const [home, setHome] = useState({ hero: [], slides: [], intro: null, settings: {} });
  const [gallery, setGallery] = useState([]);
  const [packages, setPackages] = useState([]);
  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const revealRef = useRef(null);

  useEffect(() => {
    getHome().then(setHome).catch(() => {});
    getGallery().then((d) => setGallery(Array.isArray(d) ? d.slice(0, 8) : [])).catch(() => {});
    getPackages().then((d) => setPackages(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {});
  }, []);

  // Reveal on scroll
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

  // Hero carousel
  useEffect(() => {
    if (!home.hero?.length) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % home.hero.length), 5500);
    return () => clearInterval(t);
  }, [home.hero]);

  const currentHero = home.hero[slide] || home.hero[0] || null;

  return (
    <main ref={revealRef} className="pf-root pf-paper">
      {/* HERO ------------------------------------------------------ */}
      <section className="relative min-h-screen pt-24 md:pt-32 pb-16 overflow-hidden">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            {/* Headline */}
            <div className="lg:col-span-7 pf-reveal">
              <p className="pf-eyebrow">Vol. 07 · Spring 2025 · Est. Dhaka</p>
              <h1 className="pf-display mt-6 font-light leading-[0.92] tracking-tight">
                <span className="block text-[14vw] sm:text-[12vw] lg:text-[8.8rem]">We frame</span>
                <span className="block text-[14vw] sm:text-[12vw] lg:text-[8.8rem] italic text-sepia">
                  the quiet
                </span>
                <span className="block text-[14vw] sm:text-[12vw] lg:text-[8.8rem]">hours</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg text-carbon/75 leading-relaxed">
                BiyeBuzz.com is a small photography studio based in Dhaka, working with
                couples, families, and brands across South Asia. We are drawn to the in-between
                — a glance, a held breath, the light on a wall at five p.m.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/portfolio/book" className="pf-btn">
                  Reserve a Date →
                </Link>
                <Link to="/portfolio/gallery" className="pf-btn pf-btn-ghost">
                  View Portfolio
                </Link>
              </div>
            </div>

            {/* Side metadata + slide */}
            <div className="lg:col-span-5 space-y-6 pf-reveal pf-reveal-delay-2">
              <div className="pf-rule-thick w-12" />
              <p className="pf-eyebrow !text-carbon/70">Current Issue</p>
              <div className="relative aspect-[4/5] overflow-hidden bg-carbon">
                {currentHero?.image && (
                  <img
                    src={currentHero.image}
                    alt={currentHero.title || ''}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="pf-vignette absolute inset-0" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
                  <p className="pf-eyebrow !text-sepia-soft">
                    Slide {(slide + 1).toString().padStart(2, '0')} / {home.hero.length || 1}
                  </p>
                  <h3 className="pf-display text-2xl mt-1">{currentHero?.title || 'Cover'}</h3>
                </div>
              </div>
              {home.hero.length > 1 && (
                <div className="flex gap-1.5">
                  {home.hero.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={[
                        'h-1 flex-1 transition-all',
                        i === slide ? 'bg-carbon' : 'bg-carbon/20 hover:bg-carbon/40',
                      ].join(' ')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pf-eyebrow !text-carbon/50 hidden md:block">
          ↓ Scroll
        </div>
      </section>

      {/* INTRO ----------------------------------------------------- */}
      {home.intro && (
        <section className="border-y border-carbon/15 bg-paper-50 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 pf-reveal">
            <p className="pf-eyebrow text-center">From the Studio</p>
            <p className="mt-8 pf-quote text-3xl sm:text-4xl md:text-5xl leading-tight text-carbon">
              {home.intro.headline}
            </p>
            {home.intro.body && (
              <p className="mt-8 text-center text-carbon/75 leading-relaxed text-lg max-w-3xl mx-auto">
                {home.intro.body}
              </p>
            )}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <Stat n="08" label="Years framing" />
              <Stat n="420+" label="Weddings & events" />
              <Stat n="14" label="Awards & features" />
            </div>
          </div>
        </section>
      )}

      {/* SERVICES STRIP ------------------------------------------- */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between mb-12 pf-reveal">
            <div>
              <p className="pf-eyebrow">Services · 01</p>
              <h2 className="pf-display mt-3 text-5xl sm:text-6xl font-light">
                What we make
              </h2>
            </div>
            <Link to="/portfolio/services" className="pf-link hidden md:inline-block">
              All services →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-carbon/15 pf-reveal">
            {[
              ['Wedding Day', 'Editorial coverage of the whole day.'],
              ['Pre-Wedding', 'Cinematic couple stories.'],
              ['Cinematography', '4K narrative films.'],
              ['Events', 'Brands, conferences, parties.'],
              ['Portrait', 'Family, maternity, personal.'],
              ['Product', 'Studio and lifestyle.'],
            ].map(([title, blurb]) => (
              <Link
                key={title}
                to="/portfolio/services"
                className="group bg-paper hover:bg-paper-50 transition-colors p-7 sm:p-9 block"
              >
                <p className="pf-eyebrow !text-carbon/50">↳ 0{(['Wedding Day', 'Pre-Wedding', 'Cinematography', 'Events', 'Portrait', 'Product'].indexOf(title) + 1)}</p>
                <h3 className="pf-display text-2xl mt-3 group-hover:text-sepia transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-carbon/70 leading-relaxed">{blurb}</p>
                <p className="mt-6 pf-eyebrow !text-sepia opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PORTFOLIO --------------------------------------- */}
      <section className="py-24 sm:py-32 bg-paper-50 border-y border-carbon/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between mb-12 pf-reveal">
            <div>
              <p className="pf-eyebrow">Selected Works · 02</p>
              <h2 className="pf-display mt-3 text-5xl sm:text-6xl font-light">
                The portfolio
              </h2>
            </div>
            <Link to="/portfolio/gallery" className="pf-link hidden md:inline-block">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7 pf-reveal">
            {gallery.slice(0, 4).map((item, i) => (
              <GalleryCard key={item._id || i} item={item} onOpen={setLightbox} />
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES TEASER ------------------------------------------ */}
      {packages.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex items-end justify-between mb-12 pf-reveal">
              <div>
                <p className="pf-eyebrow">Packages · 03</p>
                <h2 className="pf-display mt-3 text-5xl sm:text-6xl font-light">
                  Three ways to book
                </h2>
              </div>
              <Link to="/portfolio/packages" className="pf-link hidden md:inline-block">
                All packages →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 pf-reveal">
              {packages.map((p, i) => (
                <PackageCard key={p._id || i} pkg={p} featured={i === 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MARQUEE + TESTIMONIAL ------------------------------------ */}
      <section className="border-y border-carbon/15 py-10 overflow-hidden bg-carbon text-paper">
        <div className="pf-marquee">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center">
              {[
                'Wedding Day',
                'Editorial',
                'Cinematography',
                'Pre-Wedding',
                'Portrait',
                'Events',
                'Documentary',
                'Brand Stories',
                'Frame the Quiet',
              ].map((t, i) => (
                <div key={`${dup}-${i}`} className="flex items-center px-10">
                  <span className="pf-display text-4xl md:text-5xl font-light whitespace-nowrap">
                    {t}
                  </span>
                  <span className="mx-8 text-sepia">✦</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-paper-50">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pf-reveal">
          <p className="pf-eyebrow text-center">What people say</p>
          <p className="mt-8 pf-quote text-3xl sm:text-4xl md:text-5xl text-center leading-tight">
            “Aamir was invisible in the best way — we have hundreds of frames that feel
            like memories, not photos. Two years on, we still find new favourites.”
          </p>
          <p className="mt-8 text-center pf-eyebrow !text-carbon/60">
            — Ruba & Sami · Garden Wedding, Sylhet · 2024
          </p>
        </div>
      </section>

      {/* FINAL CTA ------------------------------------------------ */}
      <section className="relative py-32 sm:py-40 bg-carbon text-paper overflow-hidden">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center pf-reveal">
          <p className="pf-eyebrow !text-sepia">Now Booking · 2025 & 2026</p>
          <h2 className="pf-display mt-6 font-light text-6xl sm:text-7xl md:text-8xl leading-[0.95]">
            Let's <span className="italic text-sepia">make</span> something
            <br /> worth keeping.
          </h2>
          <p className="mt-8 text-paper/70 max-w-xl mx-auto text-lg leading-relaxed">
            We take on a limited number of weddings each year. Send us a note about your day
            and we'll get back within 24 hours.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/portfolio/book" className="pf-btn !bg-paper !text-carbon hover:!bg-sepia hover:!text-paper">
              Reserve a Date →
            </Link>
          </div>
        </div>
      </section>

      {/* LIGHTBOX ------------------------------------------------- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-carbon/95 backdrop-blur-sm grid place-items-center p-5"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 pf-eyebrow !text-paper hover:!text-sepia"
          >
            Close ✕
          </button>
          <img
            src={lightbox.coverImage || lightbox.image}
            alt={lightbox.title}
            className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 pf-display text-paper text-2xl">{lightbox.title}</p>
        </div>
      )}
    </main>
  );
}

function Stat({ n, label }) {
  return (
    <div className="text-center">
      <p className="pf-display text-5xl md:text-6xl font-light text-carbon">{n}</p>
      <p className="mt-2 pf-eyebrow !text-carbon/60">{label}</p>
    </div>
  );
}
