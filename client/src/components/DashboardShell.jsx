import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Home,
  Sparkles,
  Images,
  PackageSearch,
  Info,
  BookOpen,
  CalendarCheck,
  Boxes,
  CalendarDays,
  GalleryHorizontal,
  Newspaper,
  MessageSquareQuote,
  Users,
  ShieldCheck,
  Search,
  LogOut,
  Menu,
  X,
  Sliders,
  Settings,
  Film,
  Scroll,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// One nav tile. On md+ it renders either icon + label (expanded) or icon-only
// with a hover tooltip (collapsed). On mobile it always renders icon + label
// inside the drawer.
function NavItem({ to, label, end = false, icon: Icon, onNavigate, collapsed = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={({ isActive }) =>
        'group relative flex min-h-[44px] items-center rounded-xl transition ' +
        (collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5') +
        ' ' +
        (isActive
          ? 'bg-charcoal text-gold shadow-soft'
          : 'text-charcoal/70 hover:bg-taupe/10 hover:text-charcoal')
      }
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />}
      {!collapsed && (
        <span className="text-sm font-medium md:block">{label}</span>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-xs font-medium text-gold opacity-0 shadow-lg ring-1 ring-taupe/30 transition group-hover:opacity-100 md:block">
          {label}
        </span>
      )}
    </NavLink>
  );
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return <Search className={className} strokeWidth={1.8} />;
}

export default function DashboardShell({
  variant = 'admin',         // 'admin'
  title,                    // required: page heading rendered in the topbar
  searchPlaceholder,
  topbarRight,              // optional ReactNode rendered in the topbar right
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Hydrate sidebar collapsed preference from localStorage once we know the user.
  useEffect(() => {
    if (!user?._id) return;
    try {
      const v = window.localStorage.getItem(`cm.sidebar.collapsed.${user._id}`);
      if (v === 'true') setCollapsed(true);
    } catch {
      /* private mode / quota — ignore */
    }
  }, [user?._id]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      if (user?._id) {
        try {
          window.localStorage.setItem(`cm.sidebar.collapsed.${user._id}`, String(next));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    return () => setDrawerOpen(false);
  }, [navigate]);

  // Lock body scroll while the drawer is open on small screens.
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e) { if (e.key === 'Escape') setDrawerOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const isAdmin = variant === 'admin';
  const base = '/admin';

  const adminNav = [
    { to: `${base}`,                label: 'Home',            end: true, icon: Home },
    { to: `${base}/packages`,       label: 'Manage Packages', icon: Boxes },
    { to: `${base}/bookings`,       label: 'Manage Bookings', icon: CalendarDays },
    { to: `${base}/portfolio`,      label: 'Manage Portfolio',icon: GalleryHorizontal },
    { to: `${base}/testimonials`,   label: 'Testimonials',    icon: MessageSquareQuote },
    { to: `${base}/admins`,         label: 'Admin Profile',   icon: ShieldCheck },
    { to: `${base}/heroslides`,     label: 'Manage Hero Slides', icon: Sliders },
    { to: `${base}/stories`,        label: 'Manage Stories',    icon: Scroll },
    { to: `${base}/videos`,         label: 'Manage Videos',     icon: Film },
    { to: `${base}/settings`,       label: 'Manage Settings',   icon: Settings },
  ];
  const nav = adminNav;

  function onSearch(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`${base}/search?q=${encodeURIComponent(q.trim())}`);
  }

  function closeDrawer() { setDrawerOpen(false); }

  function onLogout() {
    setDrawerOpen(false);
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Mobile drawer — slides in from the left on small screens. */}
      <div
        className={
          'fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ' +
          (drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-taupe/20 bg-cream shadow-xl transition-transform duration-200 ease-out md:hidden ' +
          (drawerOpen ? 'translate-x-0' : '-translate-x-full')
        }
        aria-label={isAdmin ? 'Admin navigation' : 'Main navigation'}
      >
        <div className="flex items-center justify-between border-b border-taupe/20 px-4 py-3">
          <Link to={base} onClick={closeDrawer} title={isAdmin ? 'Admin home' : 'Home'} aria-label={isAdmin ? 'Admin home' : 'Home'}>
            <Logo size={36} />
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            title="Close menu"
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-lg text-charcoal/70 hover:bg-taupe/10"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} collapsed={false} onNavigate={closeDrawer} />
          ))}
        </nav>

        <div className="border-t border-taupe/20 px-3 py-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-charcoal/80 transition hover:bg-taupe/10 hover:text-charcoal"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Desktop sidebar — sticky, collapsible rail (md and up). */}
      <aside
        className={
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-taupe/20 bg-cream transition-[width] duration-200 ease-in-out md:flex ' +
          (collapsed ? 'w-20' : 'w-60')
        }
      >
        {/* Header: logo + wordmark + collapse toggle */}
        <div className="flex items-center justify-between gap-2 border-b border-taupe/20 px-3 py-4">
          <Link
            to={base}
            title={isAdmin ? 'Admin home' : 'Home'}
            aria-label={isAdmin ? 'Admin home' : 'Home'}
            className="flex min-w-0 items-center gap-2 overflow-hidden"
          >
            <Logo size={40} />
            {!collapsed && (
              <span className="truncate text-sm font-semibold text-charcoal">Admin</span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="group relative grid h-9 w-9 shrink-0 place-items-center rounded-lg text-charcoal/70 transition hover:bg-taupe/10 hover:text-charcoal"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-xs font-medium text-gold opacity-0 shadow-lg ring-1 ring-taupe/30 transition group-hover:opacity-100 md:block">
              {collapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} collapsed={collapsed} />
          ))}
        </nav>

        {/* Footer: sign out */}
        <div className="border-t border-taupe/20 px-3 py-3">
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className={
              'group relative flex min-h-[44px] w-full items-center rounded-xl text-charcoal/70 transition hover:bg-taupe/10 hover:text-charcoal ' +
              (collapsed ? 'justify-center p-2.5' : 'gap-3 px-3')
            }
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.8} />
            {!collapsed && <span className="text-sm font-semibold">Sign out</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-xs font-medium text-gold opacity-0 shadow-lg ring-1 ring-taupe/30 transition group-hover:opacity-100 md:block">
                Sign out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col bg-cream">
        {/* Topbar — sticky, wraps gracefully on mobile. */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-taupe/20 bg-cream/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 md:flex-nowrap">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            title="Open menu"
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-lg text-charcoal hover:bg-taupe/10 md:hidden"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>

          <Link
            to={base}
            title={isAdmin ? 'Admin home' : 'Home'}
            aria-label={isAdmin ? 'Admin home' : 'Home'}
            className="md:hidden"
          >
            <Logo size={32} />
          </Link>

          {title && (
            <h1 className="order-1 basis-full whitespace-nowrap text-xl font-bold text-charcoal sm:text-2xl md:order-none md:basis-auto">
              {title}
            </h1>
          )}

          <form
            onSubmit={onSearch}
            className="order-3 flex w-full max-w-xl items-center gap-2 md:order-none md:ml-6 md:flex-1"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50">
                <SearchIcon />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder || (isAdmin ? 'Search bookings, users…' : 'Search')}
                className="h-11 w-full rounded-md border border-taupe/30 bg-white py-2 pl-9 pr-3 text-sm text-charcoal placeholder:text-charcoal/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:h-10"
              />
            </div>
            <button
              type="submit"
              title="Search"
              aria-label="Search"
              className="grid h-11 w-11 place-items-center rounded-md bg-gold text-charcoal hover:bg-gold/90 sm:h-10 sm:w-10"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>



          {topbarRight}
        </header>

        <main className="flex-1 bg-cream px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </main>

        <Footer />
      </div>

    </div>
  );
}
