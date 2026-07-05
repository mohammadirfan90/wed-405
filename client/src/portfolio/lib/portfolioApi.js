import axios from 'axios';

/**
 * The user-facing SPA speaks these endpoints:
 *   GET    /api/home           -> hero banner + intro
 *   GET    /api/about          -> bio + team
 *   GET    /api/services       -> photography services (list)
 *   GET    /api/gallery        -> portfolio items
 *   GET    /api/categories     -> portfolio categories
 *   GET    /api/packages       -> packages
 *   POST   /api/bookings       -> submit booking
 *
 * The existing Chronos Moments backend exposes:
 *   /api/hero, /api/story, /api/packages, /api/portfolio, /api/bookings, /api/settings
 *
 * This module maps the two sets together and ships curated fallbacks
 * for endpoints that have no backend equivalent, so the SPA always renders.
 */

const base = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Reuse the same auth-token propagation as the main app
base.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('cm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

const safe = (p) => p.then((r) => r.data).catch(() => null);

const FALLBACK_SERVICES = [
  {
    _id: 'svc-wedding',
    title: 'Wedding Day Coverage',
    category: 'Wedding',
    summary:
      'Full-day editorial coverage of your ceremony, rituals, and reception — two photographers, candid and directed frames, same-day sneak peeks.',
    deliverables: ['600+ edited frames', 'Private online gallery', 'Custom USB keepsake box'],
    duration: '10 hours',
    startingFrom: 4500,
  },
  {
    _id: 'svc-prewed',
    title: 'Pre-Wedding Story',
    category: 'Pre-Wedding',
    summary:
      'Cinematic couple shoot in a location of your choosing — coastline, heritage sites, or the city at blue hour. Wardrobe and mood-board consult included.',
    deliverables: ['80 retouched frames', 'Short teaser film', 'Print release for invitations'],
    duration: 'Half day',
    startingFrom: 1200,
  },
  {
    _id: 'svc-cine',
    title: 'Cinematography',
    category: 'Cinematography',
    summary:
      '4K narrative films cut from your day — vows, toasts, dancing, and the in-between moments. Color graded to a signature warm-archive look.',
    deliverables: ['8–12 min feature film', '60 sec reel for socials', 'Raw BTS folder'],
    duration: 'Full day',
    startingFrom: 3000,
  },
  {
    _id: 'svc-event',
    title: 'Events & Receptions',
    category: 'Event',
    summary:
      'Conferences, brand activations, and private parties documented with a low-profile two-shooter team. Same-week turnaround for press needs.',
    deliverables: ['400+ edited frames', '24h highlight set', 'On-site tethered backup'],
    duration: '4–8 hours',
    startingFrom: 1800,
  },
  {
    _id: 'svc-portrait',
    title: 'Portrait Sessions',
    category: 'Portrait',
    summary:
      'Studio or location portraits for personal branding, families, and editorial work. Includes styling direction and a film-look grade on request.',
    deliverables: ['25 retouched frames', 'Two looks', 'Web-ready exports'],
    duration: '2 hours',
    startingFrom: 650,
  },
  {
    _id: 'svc-product',
    title: 'Product & Editorial',
    category: 'Editorial',
    summary:
      'E-commerce and lookbook photography with art-direction support. Lighting tests, color-checked files, and lifestyle pairings on request.',
    deliverables: ['Tethered capture', 'Color-checked TIFFs', 'Web + social crops'],
    duration: 'Per project',
    startingFrom: 900,
  },
];

const FALLBACK_TEAM = [
  {
    _id: 'tm-1',
    name: 'Ayaan Chowdhury',
    role: 'Principal Photographer',
    bio: 'Founded the studio in 2017 after a decade in photojournalism. Specialises in documentary-style weddings and quiet portraiture.',
    portrait:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80&auto=format&fit=crop',
  },
  {
    _id: 'tm-2',
    name: 'Marium Haque',
    role: 'Lead Cinematographer',
    bio: 'Films your day like a feature. Background in documentary direction; obsessed with natural light and 35mm grain.',
    portrait:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80&auto=format&fit=crop',
  },
  {
    _id: 'tm-3',
    name: 'Rakin Taher',
    role: 'Second Shooter',
    bio: 'The quiet half of the duo. Locks in candids during rituals, receptions, and the long dance-floor sets.',
    portrait:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80&auto=format&fit=crop',
  },
  {
    _id: 'tm-4',
    name: 'Lina Karim',
    role: 'Studio Manager',
    bio: 'Runs the diary, the inbox, and the album design process. Your first hello and your final hand-off.',
    portrait:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80&auto=format&fit=crop',
  },
];

/* ------------------------------------------------------------------ *
 *  Endpoints
 * ------------------------------------------------------------------ */

export async function getHome() {
  const [hero, story, settings] = await Promise.all([
    safe(base.get('/hero')),
    safe(base.get('/content?section=story')),
    safe(base.get('/settings')),
  ]);

  const slides = (hero || []).slice(0, 4);
  const intro = (story || [])[0] || null;

  return {
    hero: slides[0] || null,
    slides,
    intro,
    settings: settings || {},
  };
}

export async function getAbout() {
  const [story, settings] = await Promise.all([
    safe(base.get('/content?section=story')),
    safe(base.get('/settings')),
  ]);
  return {
    story: story || [],
    settings: settings || {},
    team: FALLBACK_TEAM,
  };
}

export async function getServices() {
  return FALLBACK_SERVICES;
}

export async function getCategories() {
  const portfolio = await safe(base.get('/portfolio'));
  const set = new Set();
  (portfolio || []).forEach((p) => p.category && set.add(p.category));
  if (set.size === 0) {
    ['Wedding', 'Pre-Wedding', 'Engagement', 'Event', 'Editorial', 'Holud'].forEach((c) => set.add(c));
  }
  return ['All', ...Array.from(set).sort()];
}

export async function getGallery(category) {
  const url = category && category !== 'All' ? `/gallery?category=${encodeURIComponent(category)}` : '/gallery';
  const items = await safe(base.get(url));
  return (items || []).filter((p) => p.isPublished !== false);
}

export async function getPackages(category) {
  const url = category && category !== 'All' ? `/packages?category=${encodeURIComponent(category)}` : '/packages';
  const items = await safe(base.get(url));
  return (items || []).filter((p) => p.isActive !== false);
}

export async function createBooking(payload) {
  const { data } = await base.post('/bookings', payload);
  return data;
}

export async function getSettings() {
  return (await safe(base.get('/settings'))) || {};
}

export default base;
