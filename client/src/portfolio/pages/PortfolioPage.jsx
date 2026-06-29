import { useEffect, useMemo, useRef, useState } from 'react';
import { getCategories, getGallery } from '../lib/portfolioApi';
import GalleryCard from '../components/GalleryCard';

/**
 * PortfolioPage — tab filter + masonry grid + lightbox.
 * Categories are derived from /api/portfolio items; falls back to a
 * curated list if the backend returns nothing.
 */
export default function PortfolioPage() {
  const [categories, setCategories] = useState(['All']);
  const [active, setActive] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const revealRef = useRef(null);

  // Load categories once
  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length) setCategories(['All', ...cats.filter((c) => c !== 'All')]);
      })
      .catch(() => {});
  }, []);

  // Reload gallery on filter change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getGallery(active)
      .then((d) => {
        if (!cancelled) setItems(Array.isArray(d) ? d : []);
      })
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [active]);

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
  }, [items]);

  const activeIndex = useMemo(
    () => items.findIndex((it) => (it._id || it.id) === (lightbox?._id || lightbox?.id)),
    [items, lightbox],
  );

  function prev() {
    if (!items.length) return;
    const i = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
    setLightbox(items[i]);
  }
  function next() {
    if (!items.length) return;
    const i = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
    setLightbox(items[i]);
  }

  // Keyboard
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, activeIndex, items]);

  return (
    <main ref={revealRef} className="pf-root pf-paper">
      {/* MASTHEAD ------------------------------------------------- */}
      <section className="relative pt-32 md:pt-44 pb-12">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-9 pf-reveal">
              <p className="pf-eyebrow">Selected Works · {items.length || '—'} Pieces</p>
              <h1 className="pf-display mt-6 font-light text-7xl sm:text-8xl md:text-9xl leading-[0.86] tracking-tight">
                The
                <br />
                <span className="italic text-sepia">portfolio</span>.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-3 pf-reveal pf-reveal-delay-2">
              <div className="pf-rule-thick w-12 mb-4" />
              <p className="pf-eyebrow !text-carbon/70">Filter by</p>
              <p className="mt-2 text-sm text-carbon/65">
                Click a category to narrow the selection. Hover for meta, click for the
                lightbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TABS ----------------------------------------------------- */}
      <section className="sticky top-16 md:top-20 z-30 bg-paper/90 backdrop-blur-md border-y border-carbon/15">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-2 px-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                data-active={c === active}
                className="pf-tab whitespace-nowrap px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] transition-all border"
              >
                {c}
                <span className="ml-2 text-carbon/40">
                  ({c === 'All' ? items.length : items.filter((i) => i.category === c).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GRID ----------------------------------------------------- */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {loading ? (
            <SkeletonGrid />
          ) : items.length === 0 ? (
            <div className="py-32 text-center pf-reveal">
              <p className="pf-eyebrow">Empty roll</p>
              <p className="mt-4 pf-display text-3xl">No frames in this category yet.</p>
              <p className="mt-2 text-carbon/65">Try another filter — or check back soon.</p>
            </div>
          ) : (
            <div
              className="pf-masonry columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]"
              key={active}
            >
              {items.map((item, i) => (
                <div
                  key={item._id || i}
                  className="mb-6 break-inside-avoid pf-reveal"
                  style={{ transitionDelay: `${Math.min(i * 60, 400)}ms` }}
                >
                  <GalleryCard item={item} onOpen={setLightbox} priority={i < 4} />
                  {item.location && (
                    <p className="mt-3 pf-eyebrow !text-carbon/55">{item.location}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX ------------------------------------------------- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-carbon/95 backdrop-blur-sm grid place-items-center"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            className="absolute top-5 right-5 pf-eyebrow !text-paper hover:!text-sepia"
          >
            Close ✕
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 md:left-8 pf-eyebrow !text-paper hover:!text-sepia"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 md:right-8 pf-eyebrow !text-paper hover:!text-sepia"
          >
            Next →
          </button>

          <figure
            className="max-h-[88vh] max-w-[92vw] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.coverImage || lightbox.image}
              alt={lightbox.title || ''}
              className="max-h-[78vh] max-w-full object-contain shadow-2xl"
            />
            <figcaption className="mt-4 text-center">
              <p className="pf-display text-paper text-2xl">{lightbox.title}</p>
              <p className="mt-1 pf-eyebrow !text-paper/60">
                {(activeIndex >= 0 ? activeIndex + 1 : 0)} / {items.length}
                {lightbox.location ? ` · ${lightbox.location}` : ''}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="pf-masonry columns-1 sm:columns-2 lg:columns-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="mb-6 break-inside-avoid aspect-[4/5] bg-carbon/8 animate-pulse"
          style={{ aspectRatio: i % 2 ? '3/4' : '4/5' }}
        />
      ))}
    </div>
  );
}
