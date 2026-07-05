import { Link } from 'react-router-dom';

/**
 * Site footer for the portfolio SPA. Editorial "colophon" style —
 * four columns (brand, sitemap, contact, social) over a film-strip divider.
 */
export default function PortfolioFooter({ settings = {} }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-carbon text-paper mt-0">
      <div className="pf-filmstrip opacity-30" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-light text-paper" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '3.25rem', lineHeight: 1 }}>
                BiyeBuzz.com
              </span>
            </div>
            <p className="pf-quote text-2xl md:text-3xl text-paper/90 max-w-md">
              A photography practice documenting love, ritual, and the quiet in-between.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-tag !border-paper/30 !text-paper/80 hover:!text-sepia hover:!border-sepia transition"
                >
                  Facebook
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-tag !border-paper/30 !text-paper/80 hover:!text-sepia hover:!border-sepia transition"
                >
                  Instagram
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-tag !border-paper/30 !text-paper/80 hover:!text-sepia hover:!border-sepia transition"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          {/* Sitemap */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="pf-eyebrow !text-sepia">Index</h4>
            <ul className="space-y-2.5 pf-display text-lg">
              {[
                ['Home', '/portfolio'],
                ['About', '/portfolio/about'],
                ['Services', '/portfolio/services'],
                ['Portfolio', '/portfolio/gallery'],
                ['Packages', '/portfolio/packages'],
                ['Book Now', '/portfolio/book'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-paper/80 hover:text-sepia transition-colors inline-flex items-center gap-2"
                  >
                    <span className="font-mono text-[10px] text-paper/40">↳</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="pf-eyebrow !text-sepia">Studio</h4>
            <div className="space-y-2 text-sm text-paper/80 leading-relaxed">
              {settings.contact_address && <p>{settings.contact_address}</p>}
              {settings.contact_phone && (
                <p>
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-sepia transition">
                    {settings.contact_phone}
                  </a>
                </p>
              )}
              {settings.contact_email && (
                <p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-sepia transition"
                  >
                    {settings.contact_email}
                  </a>
                </p>
              )}
            </div>
            <div className="pt-3 pf-rule !bg-paper/20" />
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-paper/50">
              Studio hours — by appointment, Tuesday to Saturday
            </p>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-paper/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-paper/50">
            © {year} BiyeBuzz.com · All rights reserved
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-paper/50">
            Made on a Leica, a Moleskine, and a lot of coffee
          </p>
        </div>
      </div>
    </footer>
  );
}
