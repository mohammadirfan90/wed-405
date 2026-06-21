import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserHome() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  useEffect(() => {
    api.get('/packages').then(({ data }) => setPackages(data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <DashboardShell variant="user" title="Home" searchPlaceholder="Search">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">
          Welcome back, {user?.name?.split(' ')[0] || 'friend'} 👋
        </h2>
        <p className="text-sm text-ink-muted">
          Discover our packages and book your perfect moment.
        </p>
      </div>

      <h3 className="mb-3 text-lg font-semibold text-ink">Featured Packages</h3>
      {packages.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-sm text-ink-muted shadow-soft">
          No packages available yet. Please check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <Link
              key={p._id}
              to={`/dashboard/packages/${p._id}`}
              className="group rounded-xl bg-white p-4 shadow-soft transition hover:-translate-y-0.5"
            >
              <div className="mb-2 inline-block rounded-full bg-lav-200 px-2 py-0.5 text-xs font-semibold text-ink-muted">
                {p.category}
              </div>
              <div className="text-base font-semibold text-ink group-hover:text-brand">{p.title}</div>
              <div className="mt-1 text-sm text-ink-muted">
                {p.currency} {p.price.toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
