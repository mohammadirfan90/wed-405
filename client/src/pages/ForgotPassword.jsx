import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import api from '../lib/api';

export default function ForgotPassword() {
  const [mode, setMode] = useState('phone'); // 'phone' | 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const identifier = mode === 'phone' ? phone : email.trim();
    if (!identifier) {
      return setError(mode === 'phone' ? 'Enter your phone number' : 'Enter your email');
    }
    try {
      setSubmitting(true);
      await api.post('/auth/forgot-password', { identifier });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset code');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout heading="Check your messages" sub="We sent a 6-digit reset code">
        <div className="space-y-4 text-sm text-ink-muted">
          <p>
            If <strong className="text-ink">{mode === 'phone' ? phone : email}</strong> is on
            file, a 6-digit code is on its way. It expires in 10 minutes.
          </p>
          <Link
            to={`/reset-password?mode=${mode}&identifier=${encodeURIComponent(mode === 'phone' ? phone : email.trim().toLowerCase())}`}
            className="btn-primary block text-center"
          >
            Enter the code
          </Link>
          <Link to="/login" className="block text-center text-sm font-medium text-brand hover:underline">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heading="Recover Password" sub="We'll send a 6-digit code to verify it's you">
      <div className="mb-4 flex rounded-md border border-lav-300 bg-white p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('phone')}
          className={`flex-1 rounded-sm py-1.5 font-medium transition ${
            mode === 'phone' ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          By Phone
        </button>
        <button
          type="button"
          onClick={() => setMode('email')}
          className={`flex-1 rounded-sm py-1.5 font-medium transition ${
            mode === 'email' ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          By Email
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mode === 'phone' ? (
          <div>
            <label className="label" htmlFor="phone">Contact Number</label>
            <PhoneInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        )}

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Sending code…' : 'Send reset code'}
        </button>

        <p className="text-center text-sm text-ink-muted">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}