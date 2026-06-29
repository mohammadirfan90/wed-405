import { Link } from 'react-router-dom';

function money(n, currency = 'BDT') {
  if (n == null || isNaN(n)) return '—';
  const sym = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '';
  return `${sym} ${Number(n).toLocaleString('en-IN')}`;
}

/**
 * PackageCard — editorial pricing card with category eyebrow, price,
 * features list, and a CTA that jumps to the booking form with the
 * package pre-selected.
 */
export default function PackageCard({ pkg, onSelect, featured = false }) {
  const features = pkg.features || pkg.deliverables || [];

  return (
    <article
      className={[
        'group relative flex flex-col bg-paper-50 border transition-all duration-500 pf-card',
        featured
          ? 'border-sepia shadow-sepia lg:scale-[1.02]'
          : 'border-carbon/15 hover:border-carbon/40',
      ].join(' ')}
    >
      {featured && (
        <div className="absolute -top-3 left-6 bg-sepia text-paper px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em]">
          Most Booked
        </div>
      )}

      {/* Image / category band */}
      {pkg.coverImage ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={pkg.coverImage}
            alt={pkg.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/60 to-transparent" />
          <span className="absolute top-3 left-3 pf-tag !border-paper !text-paper bg-carbon/40 backdrop-blur-sm">
            {pkg.category}
          </span>
        </div>
      ) : (
        <div className="px-6 pt-6">
          <span className="pf-tag !border-carbon/40 !text-carbon/80">{pkg.category}</span>
        </div>
      )}

      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        <h3 className="pf-display text-2xl sm:text-3xl font-light leading-tight">{pkg.title}</h3>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="pf-display text-4xl sm:text-5xl font-light tracking-tight">
            {money(pkg.price, pkg.currency)}
          </span>
          {pkg.duration && (
            <span className="pf-eyebrow !text-carbon/60">/ {pkg.duration}</span>
          )}
        </div>

        {pkg.description && (
          <p className="mt-4 text-sm text-carbon/75 leading-relaxed">{pkg.description}</p>
        )}

        {features.length > 0 && (
          <>
            <div className="pf-rule my-6" />
            <ul className="space-y-2.5 flex-1">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-carbon/80 leading-snug"
                >
                  <span className="mt-1 inline-block w-1.5 h-1.5 bg-sepia rotate-45 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onSelect && onSelect(pkg)}
            className="pf-btn flex-1"
          >
            Select Package →
          </button>
          <Link
            to={`/portfolio/book?package=${pkg._id}`}
            className="pf-btn pf-btn-ghost flex-1"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
