import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

const CATEGORIES = ['', 'Wedding', 'Cinematography', 'Pre-Wedding', 'Engagement', 'Event', 'Custom'];

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/packages', { params: category ? { category } : {} })
      .then(({ data }) => setPackages(data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <DashboardShell variant="user" title="Packages" searchPlaceholder="Search packages">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Browse Packages</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setCategory(c)}
              className={
                'rounded-full border px-3 py-1 text-xs font-semibold transition ' +
                (category === c
                  ? 'border-brand bg-brand text-white'
                  : 'border-lav-300 bg-white text-ink-muted hover:text-ink')
              }
            >
              {c || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : packages.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-sm text-ink-muted shadow-soft">
          No packages found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <div key={p._id} className="flex flex-col rounded-xl bg-white p-5 shadow-soft">
              <div className="mb-2 inline-block w-fit rounded-full bg-lav-200 px-2 py-0.5 text-xs font-semibold text-ink-muted">
                {p.category}
              </div>
              <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
              {p.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{p.description}</p>}

              {p.features?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-ink/80">
                  {p.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-ink-muted">Starting at</div>
                  <div className="text-lg font-bold text-ink">
                    {p.currency} {p.price.toLocaleString()}
                  </div>
                </div>
                <Link
                  to={`/dashboard/packages/${p._id}`}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  View & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
