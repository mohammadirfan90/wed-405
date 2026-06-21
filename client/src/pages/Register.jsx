import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  // PhoneInput always emits the full E.164 string ("+880XXXXXXXXX"),
  // so the state starts empty — no pre-prefixed "+880" here.
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError('Please enter your name');
    if (!phone || phone.length < 8) return setFormError('Enter a valid phone number');
    if (password.length < 6) return setFormError('Password must be at least 6 characters');
    if (password !== confirm) return setFormError('Passwords do not match');
    try {
      setSubmitting(true);
      await register({ name: name.trim(), phone, email: email.trim() || undefined, password });
      navigate('/', { replace: true });
    } catch (err) {
      const field = err.response?.data?.field;
      const message = err.response?.data?.message || 'Registration failed';
      setFormError(message);
      // Surface the duplicate-email case as a friendly hint with a quick action
      if (field === 'email') {
        setFormError('This email is already registered. Try logging in, or clear the email field to register with your phone only.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout heading="Create your account" sub="Join Chronos Moments to book and save your moments">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="name">Full Name</label>
          <input
            id="name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

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
          <label className="label" htmlFor="email">Email <span className="font-normal text-ink-muted">(optional)</span></label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="confirm">Confirm Password</label>
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

        {formError && (
          <div className="space-y-2">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            {formError.toLowerCase().includes('email') && (
              <div className="flex flex-wrap gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => { setEmail(''); setFormError(null); }}
                  className="font-semibold text-brand hover:underline"
                >
                  Clear email & continue
                </button>
                <Link to="/login" className="font-semibold text-brand hover:underline">
                  Go to login
                </Link>
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating account…' : 'Register'}
        </button>

        <p className="pt-2 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
