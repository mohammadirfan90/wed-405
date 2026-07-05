import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import PhoneInput from '../../components/PhoneInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Inline lock + arrow icons so the admin page is self-contained.
function LockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

// Dedicated admin sign-in. Visually distinct from the public /login so
// admins never confuse the two screens. Submits the same /auth/login API;
// non-admin accounts are rejected with a friendly message and signed back
// out so the admin token never leaks into the user session.
export default function AdminLogin() {
  const { login, logout, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setError(null);
    if (!username) {
      return setFormError('Username is required');
    }
    if (!password) {
      return setFormError('Password is required');
    }

    setSubmitting(true);
    try {
      const user = await login({ username, password });
      if (user.role !== 'admin') {
        // Roll back the customer session so the admin token never leaks.
        await logout();
        setFormError(
          'This account does not have admin access. Please use the customer sign-in page.'
        );
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Sign in failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream text-charcoal font-sans">
      {/* Delicate gold/taupe background blur spheres */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-taupe/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size={44} tone="light" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-[12px] border border-taupe/20 bg-white/80 px-4 py-2 text-xs font-semibold text-charcoal/80 shadow-sm backdrop-blur transition duration-300 hover:scale-102 hover:bg-white hover:text-charcoal"
          >
            Customer sign-in <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </header>

        {/* Centered card */}
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <div className="luxury-card p-8 md:p-10 shadow-sm border border-taupe/20 bg-cream">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-taupe/25 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-taupe">
                <LockIcon className="h-3.5 w-3.5 text-gold" />
                Admin Portal
              </div>

              <h1 className="font-serif-luxury text-3xl font-extrabold leading-tight text-charcoal">
                Sign in to manage<br />
                <span className="text-gold" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', fontWeight: 'normal' }}>BiyeBuzz.com</span>
              </h1>
              <p className="mt-3 text-sm text-charcoal/70">
                Use your admin username and password. Customer accounts cannot access this portal.
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-charcoal/70" htmlFor="admin-username">
                    Admin Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    className="w-full rounded-[12px] border border-taupe/20 bg-white px-3 py-3 text-sm text-charcoal placeholder-charcoal/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 transition duration-300"
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-charcoal/70" htmlFor="admin-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-[12px] border border-taupe/20 bg-white px-3 py-3 pr-20 text-sm text-charcoal placeholder-charcoal/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 transition duration-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-taupe hover:text-charcoal transition duration-200"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {formError && (
                  <p className="rounded-[12px] border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-700">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="luxury-button inline-flex w-full items-center justify-center gap-2 bg-charcoal px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LockIcon className="h-4 w-4" />
                  {submitting ? 'Signing in…' : 'Enter admin console'}
                </button>

                <div className="rounded-[12px] border border-taupe/15 bg-white/50 px-4 py-3 text-[11px] leading-relaxed text-charcoal/60">
                  Tip: the default seeded admin is <strong className="text-charcoal/80">admin</strong>{' '}
                  / <strong className="text-charcoal/80">Admin@12345</strong>. Run{' '}
                  <code className="rounded bg-taupe/10 px-1 text-charcoal/85">npm run seed</code> in{' '}
                  <code className="rounded bg-taupe/10 px-1 text-charcoal/85">server/</code> if needed.
                </div>
              </form>

              <div className="mt-8 flex items-center justify-between text-xs text-charcoal/60">
                <Link to="/" className="hover:text-gold transition duration-200">← Back to site</Link>
                <Link to="/login" className="hover:text-gold transition duration-200">Customer sign-in →</Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-taupe/10 pt-6 text-center text-[11px] text-charcoal/40">
          © 2026 BiyeBuzz.com · Admin Console
        </footer>
      </div>
    </div>
  );
}