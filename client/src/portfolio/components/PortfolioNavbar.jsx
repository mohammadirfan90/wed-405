import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Editorial top bar. Fixed, parchment-on-scroll, with mobile drawer.
 * Routes are sub-routes of /portfolio so we use react-router NavLink.
 */
const links = [
  { to: '/portfolio', label: 'Home', end: true },
  { to: '/portfolio/about', label: 'About' },
  { to: '/portfolio/services', label: 'Services' },
  { to: '/portfolio/gallery', label: 'Portfolio' },
  { to: '/portfolio/packages', label: 'Packages' },
];

export default function PortfolioNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-paper/90 backdrop-blur-md border-b border-carbon/15'
          : 'bg-transparent border-b border-transparent',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Wordmark */}
          <NavLink
            to="/portfolio"
            end
            className="group flex items-baseline gap-2"
            aria-label="Chronos Moments — home"
          >
            <span className="pf-display text-xl sm:text-2xl font-light tracking-tight text-carbon">
              Chronos
            </span>
            <span className="pf-display text-xl sm:text-2xl italic font-light text-sepia">
              Moments
            </span>
            <span className="hidden md:inline-block ml-2 pf-eyebrow">est. 2017</span>
          </NavLink>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  [
                    'px-3 py-2 text-[11px] font-mono uppercase tracking-[0.22em] transition-colors',
                    isActive ? 'text-sepia' : 'text-carbon/80 hover:text-carbon',
                  ].join(' ')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/portfolio/book"
              className="hidden md:inline-flex items-center gap-2 bg-carbon text-paper px-4 py-2.5 text-[11px] font-mono uppercase tracking-[0.22em] hover:bg-sepia transition-colors"
            >
              Book Now
              <span aria-hidden>→</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden flex flex-col items-end justify-center w-10 h-10 gap-1.5"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span
                className={[
                  'block h-px w-6 bg-carbon transition-all',
                  open ? 'translate-y-[3px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                className={['block h-px w-6 bg-carbon transition-all', open ? 'opacity-0' : ''].join(' ')}
              />
              <span
                className={[
                  'block h-px w-4 bg-carbon transition-all',
                  open ? '-translate-y-[3px] -rotate-45 w-6' : '',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={[
          'lg:hidden overflow-hidden border-t border-carbon/10 transition-[max-height,opacity] duration-500',
          open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <nav className="bg-paper px-5 sm:px-8 py-4 flex flex-col">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                [
                  'py-3 text-[12px] font-mono uppercase tracking-[0.22em] border-b border-carbon/10',
                  isActive ? 'text-sepia' : 'text-carbon',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/portfolio/book"
            className="mt-4 mb-2 bg-carbon text-paper text-center py-3 text-[11px] font-mono uppercase tracking-[0.22em]"
          >
            Book Now →
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
