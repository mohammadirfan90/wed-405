import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// A small helper to render a coloured "stat tile" with a number and trend.
function StatCard({ label, value, hint, tone = 'bg-white', to }) {
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to } : {};
  return (
    <Wrapper
      {...wrapperProps}
      className={
        'group flex flex-col rounded-xl p-5 shadow-soft ring-1 ring-taupe/20 transition hover:shadow-md ' +
        (to ? 'hover:-translate-y-0.5' : '') +
        ' ' + tone
      }
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-charcoal">{value ?? '—'}</span>
        {hint && <span className="text-xs text-charcoal/70">{hint}</span>}
      </div>
      {to && (
        <span className="mt-3 text-xs font-semibold text-gold group-hover:underline">
          Open →
        </span>
      )}
    </Wrapper>
  );
}

// Quick-link card pointing at a full management page.
function QuickLink({ to, title, sub, count }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl bg-white p-4 shadow-soft ring-1 ring-taupe/20 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <div className="text-sm font-semibold text-charcoal">{title}</div>
        <div className="text-xs text-charcoal/70">{sub}</div>
      </div>
      <div className="flex items-center gap-2">
        {typeof count === 'number' && (
          <span className="rounded-full bg-taupe/10 px-2 py-0.5 text-xs font-semibold text-charcoal">
            {count}
          </span>
        )}
        <span className="text-xs font-semibold text-gold">Open →</span>
      </div>
    </Link>
  );
}

// Inline status badge used in the activity feed.
function StatusPill({ children, tone = 'bg-taupe/10 text-charcoal' }) {
  return (
    <span className={'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ' + tone}>
      {children}
    </span>
  );
}

const BOOKING_TONE = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return d.toLocaleDateString();
}

export default function AdminHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    packages: 0,
    bookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    completedBookings: 0,
    admins: 0,
    activeAdmins: 0,
    portfolio: 0,
    publishedPortfolio: 0,
    blogs: 0,
    publishedBlogs: 0,
    testimonials: 0,
    pendingTestimonials: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      // Fire all reads in parallel; tolerate partial failures so the
      // dashboard still renders when one collection is empty.
      const safe = (p) => p.catch(() => ({ data: [] }));
      const [
        packages, bookings, portfolio, testimonials,
      ] = await Promise.all([
        safe(api.get('/packages/admin/all')),
        safe(api.get('/bookings')),
        safe(api.get('/gallery/admin/all')),
        safe(api.get('/testimonials/admin/all')),
      ]);
      if (cancelled) return;

      const pkgArr = packages.data || [];
      const bookArr = bookings.data || [];
      const portArr = portfolio.data || [];
      const testArr = testimonials.data || [];

      setStats({
        packages: pkgArr.length,
        bookings: bookArr.length,
        pendingBookings: bookArr.filter((b) => b.status === 'pending').length,
        approvedBookings: bookArr.filter((b) => b.status === 'approved').length,
        completedBookings: bookArr.filter((b) => b.status === 'completed').length,
        portfolio: portArr.length,
        publishedPortfolio: portArr.filter((p) => p.isPublished).length,
        testimonials: testArr.length,
        pendingTestimonials: testArr.filter((t) => !t.isApproved).length,
      });

      setRecentBookings(bookArr.slice(0, 5));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const quickLinks = useMemo(() => ([
    { to: '/admin/admins', title: 'Admin Profile', sub: 'Update profile & password' },
    { to: '/admin/packages', title: 'Manage Packages', sub: 'Create / edit offerings', count: stats.packages },
    { to: '/admin/bookings', title: 'Manage Bookings', sub: 'Approve, decline, complete', count: stats.pendingBookings },
    { to: '/admin/portfolio', title: 'Manage Portfolio', sub: 'Featured galleries', count: stats.portfolio },
    { to: '/admin/testimonials', title: 'Manage Testimonials', sub: 'Approve client quotes', count: stats.pendingTestimonials },
    { to: '/admin/heroslides', title: 'Manage Hero Slides', sub: 'Sliders and backgrounds' },
    { to: '/admin/stories', title: 'Manage Stories', sub: 'Story blocks and text' },
    { to: '/admin/videos', title: 'Manage Videos', sub: 'YouTube cinematography reels' },
    { to: '/admin/settings', title: 'Global Settings', sub: 'WhatsApp and contact info' },
  ]), [stats]);

  return (
    <DashboardShell variant="admin" title="Admin Console" searchPlaceholder="Search">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-charcoal">Admin Overview</h2>
          <p className="text-sm text-charcoal/70">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal/70">
          {loading ? 'Refreshing…' : `Updated ${new Date().toLocaleTimeString()}`}
        </div>
      </div>

      {/* Top-row KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active Bookings"
          value={stats.bookings}
          hint={`${stats.pendingBookings} pending`}
          tone="bg-white"
          to="/admin/bookings"
        />
        <StatCard
          label="Admin Profile"
          value={1}
          hint="active profile"
          tone="bg-taupe/10"
          to="/admin/admins"
        />
        <StatCard
          label="Portfolio Items"
          value={stats.portfolio}
          hint={`${stats.publishedPortfolio} published`}
          tone="bg-white"
          to="/admin/portfolio"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Packages" value={stats.packages} tone="bg-white" to="/admin/packages" />
        <StatCard
          label="Pending Testimonials"
          value={stats.pendingTestimonials}
          hint={`${stats.testimonials} total`}
          tone="bg-yellow-50"
          to="/admin/testimonials"
        />
        <StatCard
          label="Completed Bookings"
          value={stats.completedBookings}
          tone="bg-emerald-50"
          to="/admin/bookings"
        />
      </div>

      {/* Quick navigation grid */}
      <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/70">
        Manage
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((q) => (
          <QuickLink key={q.to} {...q} />
        ))}
      </div>

      {/* Activity feed */}
      <div className="mt-8">
        <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-taupe/20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-semibold text-gold hover:underline">
              View all
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-charcoal/70">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-taupe/20">
              {recentBookings.map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-charcoal">
                      {b.user?.name || 'Customer'} · {b.package?.title || 'Package'}
                    </div>
                    <div className="truncate text-xs text-charcoal/70">
                      {new Date(b.eventDate).toLocaleDateString()} · {b.venue}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill tone={BOOKING_TONE[b.status] || 'bg-taupe/10 text-charcoal'}>
                      {b.status}
                    </StatusPill>
                    <span className="text-[10px] text-charcoal/70">{timeAgo(b.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
