import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, persistToken } = useAuth();

  const initialMode = params.get('mode') === 'email' ? 'email' : 'phone';
  const initialIdentifier = params.get('identifier') || '';

  const [mode] = useState(initialMode);
  const [identifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!identifier) return setError('Missing account. Please go back and request a new code.');
    if (!/^\d{6}$/.test(otp.trim())) return setError('Enter the 6-digit code');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      setSubmitting(true);
      const { data } = await api.post('/auth/reset-password', {
        identifier, otp: otp.trim(), newPassword: password,
      });
      if (data.token) persistToken(data.token);
      if (data.user) setUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout heading="Set a new password" sub="Enter the 6-digit code we sent you">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="otp">6-digit code</label>
          <input
            id="otp"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            className="input-field text-center text-lg tracking-[0.4em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="confirm">Confirm new password</label>
          <input
            id="confirm"
            type="password"
            className="input-field"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : 'Reset password & sign in'}
        </button>

        <p className="text-center text-sm text-ink-muted">
          Didn't get a code?{' '}
          <Link to="/forgot-password" className="font-semibold text-brand hover:underline">
            Send again
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}