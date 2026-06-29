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
  Phone,
  Search,
  LogOut,
  Menu,
  X,
  Sliders,
  Settings,
  Film,
  Scroll,
} from 'lucide-react';
import Logo from './Logo.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// One nav tile. On md+ it renders icon-only (rail) with a hover tooltip.
// On mobile it renders as a full-width row with icon + label.
function NavItem({ to, label, end = false, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        // Rail variant (md+): centered icon tile, 44px touch target.
        'group relative flex items-center justify-center rounded-xl p-2.5 min-h-[44px] min-w-[44px] transition ' +
        (isActive
          ? 'bg-brand text-white shadow-soft'
          : 'text-ink/70 hover:bg-lav-200/70 hover:text-brand') +
        // Drawer variant (mobile): full row with icon + label.
        ' md:gap-0'
      }
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />}
      <span className="ml-3 text-sm font-medium md:hidden">{label}</span>
      <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-lav-200 transition group-hover:opacity-100 md:block">
        {label}
      </span>
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
    <div className="flex min-h-screen bg-white">
      {/* Mobile drawer — slides in from the left on small screens. */}
      <div
        className={
          'fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ' +
          (drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-lav-200 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ' +
          (drawerOpen ? 'translate-x-0' : '-translate-x-full')
        }
        aria-label={isAdmin ? 'Admin navigation' : 'Main navigation'}
      >
        <div className="flex items-center justify-between border-b border-lav-200 px-4 py-3">
          <Link to={base} onClick={closeDrawer} title={isAdmin ? 'Admin home' : 'Home'} aria-label={isAdmin ? 'Admin home' : 'Home'}>
            <Logo size={36} />
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            title="Close menu"
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-lg text-ink/70 hover:bg-lav-100"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} onNavigate={closeDrawer} />
          ))}
        </nav>

        <div className="border-t border-lav-200 px-3 py-3">
          <NavLink
            to={`${base}/contact`}
            onClick={closeDrawer}
            className={({ isActive }) =>
              'flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ' +
              (isActive
                ? 'bg-brand text-white shadow-soft'
                : 'text-ink/80 hover:bg-lav-100')
            }
          >
            <Phone className="h-5 w-5" strokeWidth={1.8} />
            Contact us
          </NavLink>

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink/80 transition hover:bg-rose-100 hover:text-rose-600"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Desktop sidebar — slim icon rail (md and up). */}
      <aside className="hidden w-20 shrink-0 flex-col items-center border-r border-lav-200 bg-lav-100/70 py-5 md:flex">
        <Link to={base} title={isAdmin ? 'Admin home' : 'Home'} aria-label={isAdmin ? 'Admin home' : 'Home'}>
          <Logo size={40} />
        </Link>

        <nav className="mt-8 flex w-full flex-1 flex-col items-center gap-1 px-3">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <div className="w-full px-3 pt-4">
          <NavLink
            to={`${base}/contact`}
            title="Contact us"
            aria-label="Contact us"
            className={({ isActive }) =>
              'group relative flex items-center justify-center rounded-xl p-2.5 min-h-[44px] min-w-[44px] transition ' +
              (isActive
                ? 'bg-brand text-white shadow-soft'
                : 'text-ink/70 hover:bg-lav-200/70 hover:text-brand')
            }
          >
            <Phone className="h-5 w-5" strokeWidth={1.8} />
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-lav-200 transition group-hover:opacity-100">
              Contact us
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="group relative mt-2 flex w-full items-center justify-center rounded-xl p-2.5 min-h-[44px] text-ink/70 transition hover:bg-rose-100 hover:text-rose-600"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.8} />
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-lav-200 transition group-hover:opacity-100">
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {/* Topbar — sticky, wraps gracefully on mobile. */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-lav-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 md:flex-nowrap">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            title="Open menu"
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-lg text-ink hover:bg-lav-100 md:hidden"
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
            <h1 className="order-1 basis-full whitespace-nowrap text-xl font-bold text-ink sm:text-2xl md:order-none md:basis-auto">
              {title}
            </h1>
          )}

          <form
            onSubmit={onSearch}
            className="order-3 flex w-full max-w-xl items-center gap-2 md:order-none md:ml-6 md:flex-1"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                <SearchIcon />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder || (isAdmin ? 'Search bookings, users…' : 'Search')}
                className="h-11 w-full rounded-md border border-lav-300 bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 sm:h-10"
              />
            </div>
            <button
              type="submit"
              title="Search"
              aria-label="Search"
              className="grid h-11 w-11 place-items-center rounded-md bg-brand text-white hover:bg-brand-600 sm:h-10 sm:w-10"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>



          {topbarRight}
        </header>

        <main className="flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </main>

        <Footer />
      </div>

    </div>
  );
}
