import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  MapPin,
  Camera,
  FolderOpen,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../lib/api';
import Logo from '../components/Logo.jsx';

export default function TrackBooking() {
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!bookingId || !phone) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const { data } = await api.get('/bookings/track', {
        params: {
          bookingId: bookingId.trim().toUpperCase(),
          phone: phone.trim(),
        },
      });
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find booking with those details.');
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { label: 'Booking Request Sent', status: 'pending', desc: 'We received your request.' },
    { label: 'Booking Confirmed', status: 'approved', desc: 'Admin approved and scheduled.' },
    { label: 'Photos & Videos Delivered', status: 'completed', desc: 'Your memories are ready!' },
  ];

  const getStepState = (stepStatus) => {
    if (!booking) return 'upcoming';
    const current = booking.status;

    if (current === 'cancelled' || current === 'declined') {
      return 'disabled';
    }

    if (current === 'completed') return 'completed';
    if (current === 'approved') {
      if (stepStatus === 'completed') return 'upcoming';
      return 'completed';
    }
    if (current === 'pending') {
      if (stepStatus === 'pending') return 'completed';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-charcoal font-body flex flex-col justify-between">
      {/* Header */}
      <nav className="bg-cream/90 backdrop-blur-[10px] py-4 shadow-sm border-b border-taupe/20 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/80 hover:text-gold transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-semibold text-charcoal tracking-wide flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-gold fill-gold/20" /> Track Your Booking
          </h1>
          <p className="text-sm text-charcoal/60 mt-2 max-w-md mx-auto">
            Enter your unique Booking Reference ID and Phone Number to check your status and access delivered photos/videos.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-soft border border-taupe/20 p-6 sm:p-8 max-w-md mx-auto mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-1.5">
                Booking Reference ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BB-1001"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full rounded-xl border border-taupe/30 px-4 py-3 text-sm text-charcoal outline-none focus:border-gold uppercase transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3d3a41] mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +88017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-taupe/30 px-4 py-3 text-sm text-charcoal outline-none focus:border-gold transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gold-bg-gradient text-[#0b0a0c] font-bold py-3.5 rounded-xl uppercase tracking-wider hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <Search className="h-4 w-4" /> Check Status
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Area */}
        {booking && (
          <div className="space-y-8 animate-fade-in">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-soft border border-taupe/20 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold px-2.5 py-1 bg-charcoal rounded-md font-mono">
                    {booking.bookingId}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border capitalize ${
                    booking.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    booking.status === 'approved' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    booking.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    Status: {booking.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-charcoal">
                  Package: {booking.package?.title || 'Selected Package'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-charcoal/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span>{new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span>{booking.venue}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Box */}
              {booking.status === 'completed' && (
                <div className="shrink-0 p-4 border border-blue-200 bg-blue-50/50 rounded-xl flex flex-col items-center text-center max-w-sm w-full md:w-auto">
                  <Camera className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="text-sm font-bold text-blue-800 font-serif">Your Deliverables are Ready!</h4>
                  <p className="text-xs text-blue-600/80 mt-1 mb-3">
                    Click below to open your secure Google Drive photos and videos folder.
                  </p>
                  <a
                    href={booking.googleDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider transition shadow-md w-full"
                  >
                    <FolderOpen className="h-4 w-4" /> Download Files <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Timeline Tracker */}
            <div className="bg-white rounded-2xl shadow-soft border border-taupe/20 p-6 sm:p-8">
              <h4 className="text-base font-semibold text-charcoal mb-8 border-b border-taupe/10 pb-3">
                Booking Timeline
              </h4>

              {booking.status === 'cancelled' || booking.status === 'declined' ? (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Booking {booking.status === 'cancelled' ? 'Cancelled' : 'Declined'}</h5>
                    <p className="text-xs text-red-600/80">This booking request is no longer active. Please contact support for more details.</p>
                  </div>
                </div>
              ) : (
                <div className="relative border-l-2 border-taupe/20 ml-4 pl-6 space-y-8 py-2">
                  {steps.map((step, idx) => {
                    const stepState = getStepState(step.status);
                    return (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[35px] top-0.5 rounded-full p-0.5 border-2 ${
                          stepState === 'completed' ? 'bg-gold border-gold text-white' : 'bg-white border-taupe/30 text-taupe/40'
                        }`}>
                          {stepState === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 fill-white text-gold" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <h5 className={`text-sm font-bold ${stepState === 'completed' ? 'text-charcoal' : 'text-charcoal/40'}`}>
                            {step.label}
                          </h5>
                          <p className={`text-xs mt-0.5 ${stepState === 'completed' ? 'text-charcoal/60' : 'text-charcoal/30'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-gray-400 py-6 border-t border-gray-800 text-center text-xs">
        <p>© {new Date().getFullYear()} BiyeBuzz.com. All rights reserved.</p>
      </footer>
    </div>
  );
}
