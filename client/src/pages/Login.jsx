import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // PhoneInput prepends "+880" itself — start with empty state.
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setError(null);
    if (!phone || phone.length < 8) return setFormError('Enter a valid phone number');
    if (!password) return setFormError('Password is required');
    try {
      setSubmitting(true);
      const user = await login(phone, password);
      navigate(user.role === 'admin' ? '/admin/login' : from, { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout heading="Welcome" sub="Sign in to continue your story with us">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="phone">Contact Number</label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
            Recover Password
          </Link>
        </div>

        {formError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Signing in…' : 'Login'}
        </button>

        <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-widest text-ink-muted">
          <span className="h-px flex-1 bg-lav-300" />
          <span>or</span>
          <span className="h-px flex-1 bg-lav-300" />
        </div>

        <Link to="/register" className="btn-primary">
          Register
        </Link>
      </form>
    </AuthLayout>
  );
}
