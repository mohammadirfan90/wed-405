import Logo from './Logo.jsx';

// Two-column auth shell on a white background.
// Left half: brand panel with hero image + tagline (the "story" side).
// Right half: clean white form column.
export default function AuthLayout({ children, heading, sub }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* LEFT — Brand / story panel */}
        <aside className="relative hidden overflow-hidden bg-ink md:block">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
            alt="Couple on their wedding day"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark vignette so the text stays legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <Logo size={56} tone="light" />

            <div>
              <p className="text-white/70" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.75rem', lineHeight: 1 }}>
                BiyeBuzz.com
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                Turning Your Forever Moments into Timeless Memories
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
                We bring your wedding story to life with stunning imagery and
                heartfelt storytelling — captured once, kept forever.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-white/90">
                <li className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/90">✓</span>
                  Curated packages for every kind of celebration
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/90">✓</span>
                  Easy online booking — no back-and-forth calls
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/90">✓</span>
                  Secure dashboard to track every request
                </li>
              </ul>
            </div>

            <p className="text-xs text-white/60">
              © 2026 BiyeBuzz.com. All rights reserved.
            </p>
          </div>
        </aside>

        {/* RIGHT — Form column (clean white) */}
        <main className="flex flex-col bg-white">
          {/* Mobile-only brand bar */}
          <div className="flex items-center justify-between border-b border-lav-200 px-6 py-4 md:hidden">
            <Logo size={40} />
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-md">
              {/* Small brand mark on desktop too, for symmetry */}
              <div className="hidden md:flex md:justify-start">
                <Logo size={48} />
              </div>

              <h1 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">{heading}</h1>
              {sub ? <p className="mt-2 text-sm text-ink-muted">{sub}</p> : null}

              <div className="mt-8">{children}</div>
            </div>
          </div>

          <div className="hidden border-t border-lav-200 px-12 py-4 text-xs text-ink-muted md:block">
            Need help? <span className="font-semibold text-brand">support@biyebuzz.com</span>
          </div>
        </main>
      </div>
    </div>
  );
}
