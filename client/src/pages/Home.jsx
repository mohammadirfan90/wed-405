import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  Star,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import api from '../lib/api';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function todayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function money(n) {
  if (n == null || isNaN(n)) return '—';
  return '৳ ' + Number(n).toLocaleString('en-IN');
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Content states
  const [slides, setSlides] = useState([]);
  const [stories, setStories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [videos, setVideos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [settings, setSettings] = useState({
    whatsapp_number: '+8801327292323',
    contact_email: 'info@weddingheritagebd.com',
    contact_phone: '01327292323',
    contact_address: 'Elephant Road, Dhaka, 1205',
    facebook_url: 'https://facebook.com',
    instagram_url: 'https://instagram.com',
    youtube_url: 'https://youtube.com',
  });

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Portfolio tab state
  const [activeTab, setActiveTab] = useState('Wedding');

  // Lightbox state
  const [lightbox, setLightbox] = useState(null); // { title: '', images: [], index: 0 }

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    packageId: '',
    eventDate: todayISO(),
    venue: '',
    guests: 100,
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Handle header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch all home contents in parallel
  useEffect(() => {
    const safe = (p) => p.catch(() => ({ data: [] }));

    api.get('/hero').then(({ data }) => setSlides(data)).catch(() => {});
    api.get('/story').then(({ data }) => setStories(data)).catch(() => {});
    api.get('/packages').then(({ data }) => setPackages(data)).catch(() => {});
    api.get('/portfolio').then(({ data }) => setPortfolio(data)).catch(() => {});
    api.get('/videos').then(({ data }) => setVideos(data)).catch(() => {});
    api.get('/testimonials').then(({ data }) => setTestimonials(data.filter(t => t.isApproved))).catch(() => {});
    api.get('/blogs').then(({ data }) => setBlogs(data.filter(b => b.isPublished))).catch(() => {});
    api.get('/settings').then(({ data }) => setSettings(prev => ({ ...prev, ...data }))).catch(() => {});
  }, []);

  // Hero Slider Auto-rotation
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  // Filtered portfolio albums
  const filteredPortfolio = useMemo(() => {
    return portfolio.filter(item => item.category === activeTab);
  }, [portfolio, activeTab]);

  // Scroll function
  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Booking Submit handler
  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingError(null);
    if (!bookingForm.packageId) return setBookingError('Please select a package');
    if (!bookingForm.eventDate) return setBookingError('Please select an event date');
    if (!bookingForm.venue.trim()) return setBookingError('Please specify the venue');
    if (!bookingForm.contactPhone.trim()) return setBookingError('Please enter contact phone number');

    setBookingBusy(true);
    try {
      const payload = {
        packageId: bookingForm.packageId,
        eventDate: bookingForm.eventDate,
        venue: bookingForm.venue.trim(),
        guests: Number(bookingForm.guests) || undefined,
        contactPhone: bookingForm.contactPhone.trim(),
        contactEmail: bookingForm.contactEmail.trim() || undefined,
        notes: bookingForm.notes.trim(),
      };
      
      const { data } = await api.post('/bookings', payload);
      setBookingSuccess(data);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Could not save booking request');
    } finally {
      setBookingBusy(false);
    }
  }

  // Trigger WhatsApp redirection
  function sendToWhatsapp() {
    if (!bookingSuccess) return;
    const selectedPkg = packages.find(p => p._id === bookingSuccess.package) || {};
    const formattedDate = new Date(bookingSuccess.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const text = `Hello Chronos Moments!

I would like to confirm my booking request.

Booking Details:
* Booking Reference:* ${bookingSuccess._id}
* Package:* ${selectedPkg.title || 'Selected Package'}
* Date:* ${formattedDate}
* Venue:* ${bookingSuccess.venue}
* Guests:* ${bookingSuccess.guests || 'N/A'}
* Phone:* ${bookingSuccess.contactPhone}
* Email:* ${bookingSuccess.contactEmail || 'N/A'}
* Notes:* ${bookingSuccess.notes || 'None'}

Please review my request and let me know the payment details. Thank you!`;

    const encodedText = encodeURIComponent(text);
    const cleanPhone = settings.whatsapp_number.replace(/\+/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  }

  const selectedPackageDetails = useMemo(() => {
    return packages.find(p => p._id === bookingForm.packageId) || null;
  }, [packages, bookingForm.packageId]);

  return (
    <div className="min-h-screen bg-[#0B0A0C] text-gray-100 font-body antialiased">
      {/* Dynamic Navigation Bar */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B0A0C]/90 backdrop-blur-md py-3 shadow-lg border-b border-[#D4AF37]/25' : 'bg-transparent py-5'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <Logo size={40} />
            <span className="font-serif-luxury text-xl font-bold tracking-widest text-white uppercase hidden sm:inline">
              CHRONOS <span className="text-[#D4AF37]">MOMENTS</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase">
            <button onClick={() => scrollTo('home')} className="hover:text-[#D4AF37] transition text-gray-300">Home</button>
            <button onClick={() => scrollTo('about')} className="hover:text-[#D4AF37] transition text-gray-300">About Us</button>
            <button onClick={() => scrollTo('services')} className="hover:text-[#D4AF37] transition text-gray-300">Services</button>
            <button onClick={() => scrollTo('portfolio')} className="hover:text-[#D4AF37] transition text-gray-300">Portfolio</button>
            <button onClick={() => scrollTo('packages')} className="hover:text-[#D4AF37] transition text-gray-300">Packages</button>
            <button onClick={() => scrollTo('blog')} className="hover:text-[#D4AF37] transition text-gray-300">Blog</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-[#D4AF37] transition text-gray-300">Contact Us</button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-xs font-semibold px-4 py-2 border border-gray-600 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition uppercase tracking-wider"
              >
                {user.role === 'admin' ? 'Admin Console' : 'My Dashboard'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold px-4 py-2 border border-gray-600 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => scrollTo('contact')}
              className="gold-bg-gradient hover:opacity-95 text-[#0B0A0C] font-bold text-xs px-5 py-2.5 rounded-lg shadow-md uppercase tracking-wider transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              BOOK NOW
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-[10px] font-semibold px-2 py-1.5 border border-gray-600 rounded hover:border-[#D4AF37] hover:text-[#D4AF37] transition uppercase tracking-wider"
              >
                Console
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-[10px] font-semibold px-2.5 py-1.5 border border-gray-600 rounded hover:border-[#D4AF37] hover:text-[#D4AF37] transition uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#121113] border-b border-[#D4AF37]/25 px-4 pt-2 pb-6 space-y-3 flex flex-col text-sm uppercase tracking-wider">
            <button onClick={() => scrollTo('home')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">Home</button>
            <button onClick={() => scrollTo('about')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">About Us</button>
            <button onClick={() => scrollTo('services')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">Services</button>
            <button onClick={() => scrollTo('portfolio')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">Portfolio</button>
            <button onClick={() => scrollTo('packages')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">Packages</button>
            <button onClick={() => scrollTo('blog')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">Blog</button>
            <button onClick={() => scrollTo('contact')} className="text-left py-2 hover:text-[#D4AF37] border-b border-gray-800">Contact Us</button>
            <button
              onClick={() => scrollTo('contact')}
              className="w-full text-center gold-bg-gradient py-3 rounded-lg text-[#0B0A0C] font-bold shadow-md uppercase tracking-wider"
            >
              BOOK NOW
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section Slider */}
      <section id="home" className="relative h-screen overflow-hidden">
        {slides.length > 0 ? (
          slides.map((s, index) => (
            <div
              key={s._id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {/* Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${s.image})` }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>

              {/* Dynamic Text Contents */}
              <div className="relative h-full flex items-center justify-center text-center px-4 sm:px-6">
                <div className="max-w-4xl space-y-6">
                  <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                    {s.title}
                  </h1>
                  <p className="max-w-2xl mx-auto text-sm sm:text-lg text-gray-300 font-light leading-relaxed">
                    {s.subtitle}
                  </p>
                  <div className="pt-4 flex justify-center gap-4">
                    <button
                      onClick={() => scrollTo('contact')}
                      className="gold-bg-gradient text-[#0B0A0C] font-bold px-8 py-3 rounded-lg uppercase tracking-wider hover:opacity-95 transition"
                    >
                      Book Your Session
                    </button>
                    <button
                      onClick={() => scrollTo('portfolio')}
                      className="border border-white hover:border-[#D4AF37] hover:text-[#D4AF37] text-white font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition"
                    >
                      View Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-[#D4AF37]">
            Loading Hero Slider...
          </div>
        )}

        {/* Slider Controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-gray-600 bg-[#0B0A0C]/50 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-gray-600 bg-[#0B0A0C]/50 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </section>

      {/* About Us / Stories Section */}
      <section id="about" className="py-20 border-b border-[#D4AF37]/10 bg-[#121113]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {stories.length > 0 ? (
            stories.map((s, index) => (
              <div key={s._id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Image side */}
                <div className={`relative ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                  <div className="p-3 border border-[#D4AF37]/35 rounded-2xl bg-[#0B0A0C]">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full aspect-[4/3] object-cover rounded-xl shadow-2xl filter brightness-95"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 -z-10 w-48 h-48 border-2 border-dashed border-[#D4AF37]/20 rounded-full" />
                </div>

                {/* Text side */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="h-[1px] w-8 bg-[#D4AF37]" />
                    <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">ABOUT OUR CRAFT</span>
                  </div>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    {s.title}
                  </h2>
                  <div className="text-gray-300 font-light space-y-4 whitespace-pre-line leading-relaxed">
                    {s.body}
                  </div>
                  <button
                    onClick={() => scrollTo('contact')}
                    className="inline-flex items-center gap-2 font-bold text-sm text-[#D4AF37] hover:underline uppercase tracking-wider"
                  >
                    Discuss your wedding <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Loading dynamic story data...</p>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 border-b border-[#D4AF37]/10 bg-[#0B0A0C]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Professional Services</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">What We Capture</h2>
            <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto" />
            <p className="text-sm text-gray-400 font-light">
              We specialize in capturing your special moments with luxury storytelling, artistic photography, and premium cinematography.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: 'Pre Wedding', sub: 'Romantic Couple Shoot', icon: Sparkles },
              { title: 'Holud & Mehendi', sub: 'Vibrant Colors & Joy', icon: Camera },
              { title: 'Wedding Day', sub: 'Sacred Rituals & Glamour', icon: Star },
              { title: 'Reception Night', sub: 'Grand Festivities', icon: Clock },
              { title: 'Cinematography', sub: 'Teasers & Films', icon: VideoItem },
            ].map((s, index) => (
              <div
                key={index}
                className="group relative rounded-xl border border-gray-800 bg-[#121113] p-6 hover:border-[#D4AF37] transition duration-300 cursor-pointer"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition">{s.title}</h3>
                <p className="mt-2 text-xs text-gray-400 font-light">{s.sub}</p>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section id="portfolio" className="py-20 border-b border-[#D4AF37]/10 bg-[#121113]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Our Work</span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">Featured Gallery</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2 md:border-0 md:pb-0">
              {['Wedding', 'Pre-Wedding', 'Engagement', 'Event'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-lg ${activeTab === tab ? 'gold-bg-gradient text-[#0B0A0C]' : 'border border-gray-800 hover:border-gray-600 text-gray-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setLightbox({ title: p.title, images: p.images || [], index: 0 })}
                  className="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition shadow-lg cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="h-full w-full object-cover filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-75 group-hover:opacity-85 transition" />
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                    <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">{p.category}</span>
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    {p.location && (
                      <p className="flex items-center gap-1 text-xs text-gray-300 font-light">
                        <MapPin className="h-3 w-3 text-[#D4AF37]" /> {p.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10 font-light">No published portfolio items in this category.</p>
          )}
        </div>
      </section>

      {/* Cinematography Video Carousel Section */}
      <section className="py-20 border-b border-[#D4AF37]/10 bg-[#0B0A0C]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4 mb-16 text-center">
            <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Cinematography reels</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">Cinematic Stories</h2>
            <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto" />
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => {
                // Parse video ID for rendering embed if available
                let embedId = '';
                try {
                  const url = v.youtubeUrl;
                  if (url.includes('shorts/')) embedId = url.split('shorts/')[1]?.split('?')[0];
                  else if (url.includes('v=')) embedId = url.split('v=')[1]?.split('&')[0];
                  else if (url.includes('youtu.be/')) embedId = url.split('youtu.be/')[1]?.split('?')[0];
                  else embedId = url;
                } catch {}

                return (
                  <div key={v._id} className="overflow-hidden rounded-xl border border-gray-800 bg-[#121113] p-3 shadow-soft hover:border-[#D4AF37] transition duration-300">
                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-900">
                      {embedId ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${embedId}`}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-red-600">Video Link Invalid</div>
                      )}
                    </div>
                    <div className="mt-3 px-1">
                      <h3 className="text-sm font-bold text-white truncate">{v.title || 'Cinematography Reel'}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 font-light">Loading dynamic video links...</p>
          )}
        </div>
      </section>

      {/* Packages Pricing Section */}
      <section id="packages" className="py-20 border-b border-[#D4AF37]/10 bg-[#121113]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4 mb-16 text-center">
            <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Pricing offerings</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">Investment Tiers</h2>
            <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto" />
            <p className="text-sm text-gray-400 font-light">
              Choose the perfect package to preserve your legacy. 20% advance booking secures your slot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.length > 0 ? (
              packages.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col rounded-xl border border-gray-800 bg-[#0B0A0C] p-6 hover:border-[#D4AF37] hover:shadow-2xl transition duration-300"
                >
                  <div className="border-b border-gray-800 pb-5">
                    <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3 font-serif-luxury">{p.title}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{money(p.price)}</span>
                      {p.duration && <span className="text-xs text-gray-400">/ {p.duration}</span>}
                    </div>
                  </div>

                  <ul className="my-6 space-y-3 flex-1">
                    {(p.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300 font-light">
                        <span className="text-[#D4AF37] shrink-0 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setBookingForm(f => ({ ...f, packageId: p._id }));
                      scrollTo('contact');
                    }}
                    className="w-full border border-[#D4AF37] hover:gold-bg-gradient hover:text-[#0B0A0C] text-[#D4AF37] font-bold text-xs py-3 rounded-lg uppercase tracking-wider transition text-center"
                  >
                    Select Package
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-400 font-light">Loading available packages...</p>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials / Reviews Section */}
      <section className="py-20 border-b border-[#D4AF37]/10 bg-[#0B0A0C]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4 mb-16 text-center">
            <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Client Feedback</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">Love Notes</h2>
            <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto" />
          </div>

          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t._id} className="rounded-xl border border-gray-800 bg-[#121113] p-6 flex flex-col justify-between shadow-lg">
                  <div className="space-y-4">
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-gray-300 font-light italic leading-relaxed text-sm">
                      “{t.body}”
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-gray-800 pt-4">
                    {t.avatar ? (
                      <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-700 bg-gray-900" />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-800 text-[#D4AF37] font-bold text-sm border border-gray-700">
                        {t.authorName?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.authorName}</h4>
                      <p className="text-xs text-gray-500">{t.role || 'Client'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 font-light">Reading our client comments...</p>
          )}
        </div>
      </section>

      {/* Blogs / News Grid Section */}
      <section id="blog" className="py-20 border-b border-[#D4AF37]/10 bg-[#121113]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4 mb-16 text-center">
            <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Stories & Tips</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">Our Journal</h2>
            <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto" />
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <div key={b._id} className="flex flex-col rounded-xl overflow-hidden border border-gray-800 bg-[#0B0A0C] shadow-lg group">
                  {b.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden bg-gray-900">
                      <img
                        src={b.coverImage}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-102 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider">
                        {new Date(b.publishedAt || b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition font-serif-luxury line-clamp-2">
                        {b.title}
                      </h3>
                      {b.excerpt && <p className="text-xs font-light text-gray-400 line-clamp-3">{b.excerpt}</p>}
                    </div>
                    <Link to={`/blog/${b._id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-wider pt-2">
                      Read Article <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 font-light">Loading dynamic blog entries...</p>
          )}
        </div>
      </section>

      {/* Booking Form & Contact Us Section */}
      <section id="contact" className="py-20 border-b border-[#D4AF37]/10 bg-[#0B0A0C]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Details Side */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <span className="font-serif-luxury italic text-[#D4AF37] text-sm uppercase tracking-widest">Connect With Us</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">Get in Touch</h2>
                <div className="w-16 h-[1px] bg-[#D4AF37] mt-4" />
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 border border-gray-800 text-[#D4AF37] shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Our Studio</h4>
                    <p className="mt-1 text-sm font-light text-gray-400">{settings.contact_address}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 border border-gray-800 text-[#D4AF37] shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Email Us</h4>
                    <p className="mt-1 text-sm font-light text-gray-400">{settings.contact_email}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 border border-gray-800 text-[#D4AF37] shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Call Helpline</h4>
                    <p className="mt-1 text-sm font-light text-gray-400">{settings.contact_phone}</p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Follow Our Journey</h4>
                <div className="flex gap-3">
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 border border-gray-800 hover:border-[#D4AF37] hover:text-[#D4AF37] transition text-gray-300">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 border border-gray-800 hover:border-[#D4AF37] hover:text-[#D4AF37] transition text-gray-300">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 border border-gray-800 hover:border-[#D4AF37] hover:text-[#D4AF37] transition text-gray-300">
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Booking Form Side */}
            <div className="lg:col-span-3">
              {bookingSuccess ? (
                <div className="rounded-xl border border-emerald-950 bg-emerald-950/20 p-6 space-y-6 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Clock className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Booking Saved in Dashboard</h3>
                      <p className="text-xs text-gray-400 font-light">Reference: <span className="font-mono">{bookingSuccess._id}</span></p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-black/40 p-4 border border-gray-800">
                    <h4 className="font-semibold text-white uppercase tracking-wider text-xs border-b border-gray-800 pb-2 mb-3">
                      Booking Summary
                    </h4>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Total Cost</span>
                        <span className="font-semibold text-white">{money(selectedPackageDetails?.price)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-800/40 pt-1.5 text-[#D4AF37]">
                        <span>Advance Required (20%)</span>
                        <span className="font-bold">{money(Math.round((selectedPackageDetails?.price || 0) * 0.2))}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Balance at Event</span>
                        <span>{money((selectedPackageDetails?.price || 0) - Math.round((selectedPackageDetails?.price || 0) * 0.2))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-gray-400 font-light">
                      To complete your reservation, please send your booking reference details to our official WhatsApp account. We will share the advance payment directions immediately.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={sendToWhatsapp}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-[#0B0A0C] font-bold py-3 rounded-lg uppercase tracking-wider transition"
                      >
                        <Send className="h-4 w-4" /> Send details to WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingSuccess(null);
                          setBookingForm({
                            packageId: '',
                            eventDate: todayISO(),
                            venue: '',
                            guests: 100,
                            contactPhone: '',
                            contactEmail: '',
                            notes: '',
                          });
                        }}
                        className="border border-gray-700 hover:border-gray-500 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition"
                      >
                        New Booking
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4 rounded-xl border border-gray-800 bg-[#121113] p-6 shadow-2xl">
                  <h3 className="font-serif-luxury text-xl font-bold text-white border-b border-gray-800 pb-3 mb-6">
                    Online Booking Request
                  </h3>

                  {bookingError && (
                    <div className="rounded bg-red-950/20 border border-red-900/50 px-3 py-2 text-xs text-red-400">{bookingError}</div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Package</label>
                    <select
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                      value={bookingForm.packageId}
                      onChange={(e) => setBookingForm(f => ({ ...f, packageId: e.target.value }))}
                      required
                    >
                      <option value="">— Choose a package offering —</option>
                      {packages.map((p) => (
                        <option key={p._id} value={p._id}>{p.title} ({money(p.price)})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Date</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        value={bookingForm.eventDate}
                        min={todayISO()}
                        onChange={(e) => setBookingForm(f => ({ ...f, eventDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Guests</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        value={bookingForm.guests}
                        onChange={(e) => setBookingForm(f => ({ ...f, guests: Number(e.target.value) || 100 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Venue Location</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. Sena Malancha, Dhaka Cantt."
                      value={bookingForm.venue}
                      onChange={(e) => setBookingForm(f => ({ ...f, venue: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</label>
                      <input
                        type="tel"
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="e.g. +8801712345678"
                        value={bookingForm.contactPhone}
                        onChange={(e) => setBookingForm(f => ({ ...f, contactPhone: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Email (Optional)</label>
                      <input
                        type="email"
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="customer@example.com"
                        value={bookingForm.contactEmail}
                        onChange={(e) => setBookingForm(f => ({ ...f, contactEmail: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes & Special Directions</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                      placeholder="Theme preferences, cinematography requirements, details..."
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>

                  {selectedPackageDetails && (
                    <div className="rounded-lg bg-black/40 p-4 border border-gray-800 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Total Pricing:</span>
                        <span className="font-semibold text-white">{money(selectedPackageDetails.price)}</span>
                      </div>
                      <div className="flex justify-between text-[#D4AF37]">
                        <span>Advance Required (20%):</span>
                        <span className="font-bold">{money(Math.round(selectedPackageDetails.price * 0.2))}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingBusy || !bookingForm.packageId}
                    className="w-full gold-bg-gradient py-3.5 rounded-lg text-[#0B0A0C] font-bold text-xs uppercase tracking-wider transition hover:opacity-95 disabled:opacity-50"
                  >
                    {bookingBusy ? 'Saving request…' : 'Submit Booking Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0B0A0C] border-t border-gray-900 text-gray-400 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
            <Logo size={36} />
            <span className="font-serif-luxury text-lg font-bold tracking-widest text-white uppercase">
              CHRONOS <span className="text-[#D4AF37]">MOMENTS</span>
            </span>
          </div>

          <p className="text-xs text-gray-500 font-light text-center md:text-left">
            © 2026 Chronos Moments. All Rights Reserved. Capture your forever.
          </p>

          <div className="flex gap-4">
            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition text-gray-500">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition text-gray-500">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition text-gray-500">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 justify-between"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }}
          role="dialog"
          aria-modal="true"
        >
          {/* Topbar */}
          <div className="flex items-center justify-between text-white py-2 border-b border-gray-800">
            <h4 className="font-bold text-sm truncate">{lightbox.title}</h4>
            <button
              onClick={() => setLightbox(null)}
              className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-white transition"
              aria-label="Close Gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            {lightbox.images.length > 0 ? (
              <>
                <img
                  src={lightbox.images[lightbox.index]}
                  alt=""
                  className="max-h-[70vh] max-w-[90vw] object-contain rounded-lg"
                />

                {lightbox.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setLightbox(prev => ({ ...prev, index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1 }))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition"
                      aria-label="Next Image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="text-gray-400 font-light">No images in this album.</div>
            )}
          </div>

          {/* Carousel footer */}
          <div className="text-center text-xs text-gray-500 py-3 border-t border-gray-900">
            {lightbox.images.length > 0 ? `Image ${lightbox.index + 1} of ${lightbox.images.length}` : '0 of 0'}
          </div>
        </div>
      )}
    </div>
  );
}
