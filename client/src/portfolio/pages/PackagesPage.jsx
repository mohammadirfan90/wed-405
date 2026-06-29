import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPackages } from '../lib/portfolioApi';
import PackageCard from '../components/PackageCard';

/**
 * PackagesPage — pricing grid + comparison strip + FAQ + CTA.
 */
export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const revealRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPackages()
      .then((d) => setPackages(Array.isArray(d) ? d : []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
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
  }, [packages]);

  const categories = ['All', ...Array.from(new Set(packages.map((p) => p.category).filter(Boolean)))];
  const filtered = filter === 'All' ? packages : packages.filter((p) => p.category === filter);

  function onSelect(pkg) {
    navigate(`/portfolio/book?package=${pkg._id || pkg.id}`);
  }

  return (
    <main ref={revealRef} className="pf-root pf-paper">
      {/* MASTHEAD ------------------------------------------------- */}
      <section className="relative pt-32 md:pt-44 pb-20">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-8 pf-reveal">
              <p className="pf-eyebrow">Packages · 2025 Pricing</p>
              <h1 className="pf-display mt-6 font-light text-7xl sm:text-8xl md:text-9xl leading-[0.86] tracking-tight">
                Three
                <br />
                <span className="italic text-sepia">honest</span> prices.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 pf-reveal pf-reveal-delay-2 space-y-4">
              <div className="pf-rule-thick w-12" />
              <p className="text-carbon/75 leading-relaxed">
                Every package is fully customisable — add hours, second shooters, albums, or
                drone coverage. All packages include a same-day sneak peek gallery and a
                20-page heirloom print book.
              </p>
              <p className="pf-eyebrow !text-carbon/60">20% advance · 80% due one week prior</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS ------------------------------------------- */}
      <section className="border-y border-carbon/15 bg-paper-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-4 flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              data-active={c === filter}
              className="pf-tab px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] border"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* PRICING GRID -------------------------------------------- */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-carbon/8 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center pf-reveal">
              <p className="pf-eyebrow">No packages yet</p>
              <p className="mt-4 pf-display text-3xl">Pricing is being finalised.</p>
              <Link to="/portfolio/book" className="pf-btn inline-flex mt-6">
                Send an Enquiry →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-start">
              {filtered.map((p, i) => (
                <PackageCard key={p._id || i} pkg={p} onSelect={onSelect} featured={i === 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COMPARISON TABLE ---------------------------------------- */}
      <section className="py-24 sm:py-32 bg-paper-50 border-y border-carbon/15">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pf-reveal">
          <p className="pf-eyebrow">Comparison · At a Glance</p>
          <h2 className="pf-display mt-3 text-4xl sm:text-5xl font-light">
            What's <span className="italic">included</span>.
          </h2>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-carbon">
                  <th className="py-4 pr-6 pf-eyebrow !text-carbon">Feature</th>
                  {filtered.slice(0, 3).map((p, i) => (
                    <th key={i} className="py-4 px-6 pf-display text-xl sm:text-2xl">
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Coverage Hours', '6', '10', '14'],
                  ['Edited Frames', '300', '600', '900+'],
                  ['Second Photographer', '—', '✓', '✓'],
                  ['4K Film Feature', '—', '✓', '✓'],
                  ['Same-Day Reel', '—', '—', '✓'],
                  ['Drone Aerial', '—', '—', '✓'],
                  ['Heirloom Album', '✓', '✓', '✓'],
                  ['Print Box', '—', '✓', '✓'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-carbon/15">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={[
                          'py-3.5',
                          j === 0 ? 'pr-6 font-mono text-[11px] uppercase tracking-[0.18em] text-carbon/60' : 'px-6',
                        ].join(' ')}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ ----------------------------------------------------- */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 pf-reveal">
          <p className="pf-eyebrow">Frequently Asked</p>
          <h2 className="pf-display mt-3 text-4xl sm:text-5xl font-light">Common questions</h2>

          <div className="mt-12 divide-y divide-carbon/15 border-y border-carbon/15">
            {[
              [
                'How far in advance should we book?',
                'Most couples book 9–14 months ahead, but we sometimes have last-minute availability — particularly for weekday and off-season weddings.',
              ],
              [
                'Do you travel outside Dhaka?',
                'Yes. Travel outside Dhaka is ৳350/day plus first-class transport and accommodation. We have shot in Sylhet, Cox\'s Bazar, Bandarban, and internationally.',
              ],
              [
                'Do you deliver every photograph you take?',
                'No — we deliver a curated, fully edited set. You don\'t want 4,000 frames to sort through. Expect 80–120 per hour of coverage.',
              ],
              [
                'What\'s the payment schedule?',
                '20% advance to confirm the date, 40% six weeks before, and the remaining 40% one week before. We accept bank transfer, bKash, and card.',
              ],
              [
                'Can we mix-and-match packages?',
                'Always. The packages above are starting points — we\'ll build a custom quote for your exact day.',
              ],
            ].map(([q, a]) => (
              <details key={q} className="group py-5 cursor-pointer">
                <summary className="flex items-center justify-between list-none">
                  <span className="pf-display text-xl sm:text-2xl">{q}</span>
                  <span className="text-sepia text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-carbon/75 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA ------------------------------------------------------ */}
      <section className="py-24 sm:py-32 bg-carbon text-paper relative overflow-hidden">
        <div className="pf-grain" aria-hidden />
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center pf-reveal">
          <p className="pf-eyebrow !text-sepia">Reserve · Confirm · Make</p>
          <h2 className="pf-display mt-4 text-5xl sm:text-6xl font-light leading-tight">
            Ready when you are.
          </h2>
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
