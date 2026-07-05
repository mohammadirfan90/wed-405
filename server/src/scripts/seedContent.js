// Seed the new content collections. Safe to re-run (clears target collections first).
require('dotenv').config();
const mongoose = require('mongoose');

const Portfolio = require('../models/Portfolio');
const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
// ContactMessage is user-generated — we don't seed it.

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[seed-content] Connected');

    await Promise.all([
      Portfolio.deleteMany({}),
      Blog.deleteMany({}),
      Testimonial.deleteMany({}),
    ]);
    console.log('[seed-content] Cleared portfolio/blog/testimonial collections');

    const portfolio = await Portfolio.insertMany([
      {
        title: 'Aanchal & Rohan Wedding',
        slug: 'aanchal-rohan-wedding',
        category: 'Wedding',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
        images: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
          'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=1200',
        ],
        description: 'A two-day celebration in Dhaka with traditional ceremonies and a rooftop reception.',
        eventDate: new Date('2025-02-14'),
        location: 'Dhaka, Bangladesh',
        tags: ['wedding', 'dhaka', 'rooftop'],
        isPublished: true,
      },
      {
        title: 'Pre-Wedding at Cox\'s Bazar',
        slug: 'pre-wedding-coxs-bazar',
        category: 'Pre-Wedding',
        coverImage: 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200',
        images: ['https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200'],
        description: 'Sunset frames on the world\'s longest sea beach.',
        eventDate: new Date('2025-01-20'),
        location: "Cox's Bazar",
        tags: ['pre-wedding', 'beach'],
        isPublished: true,
      },
      {
        title: 'Engagement Ceremony — Mehedi Night',
        slug: 'engagement-mehedi-night',
        category: 'Engagement',
        coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
        images: ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200'],
        description: 'Warm tones, family moments, and intricate mehedi art.',
        eventDate: new Date('2024-12-10'),
        location: 'Chittagong',
        tags: ['engagement', 'mehedi'],
        isPublished: true,
      },
    ]);
    console.log(`[seed-content] Portfolio: ${portfolio.length} items`);

    const blogs = await Blog.insertMany([
      {
        title: '10 Tips for Choosing Your Wedding Photographer',
        slug: '10-tips-wedding-photographer',
        excerpt: 'How to pick a photographer whose style matches your vision.',
        body: 'Your wedding photos are keepsakes for life. Start with style, then budget, then chemistry...',
        coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
        tags: ['wedding', 'tips'],
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: 'Cinematic Storytelling in Wedding Films',
        slug: 'cinematic-wedding-films',
        excerpt: 'Why the best wedding films feel like short movies.',
        body: 'Cinematography is more than a highlight reel. It is pacing, music, and light...',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
        tags: ['cinematography'],
        isPublished: true,
        publishedAt: new Date(),
      },
    ]);
    console.log(`[seed-content] Blogs: ${blogs.length} posts`);

    const testimonials = await Testimonial.insertMany([
      {
        authorName: 'Nusrat Jahan',
        role: 'Bride',
        avatar: 'https://i.pravatar.cc/150?img=47',
        rating: 5,
        body: 'BiyeBuzz.com made our day feel like a movie. The team was calm, kind, and insanely talented.',
        isApproved: true,
      },
      {
        authorName: 'Tahmid Khan',
        role: 'Groom',
        avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 5,
        body: 'The pre-wedding shoot at Cox\'s Bazar was unreal. Every frame felt editorial.',
        isApproved: true,
      },
      {
        authorName: 'Sadia Rahman',
        role: 'Bride',
        avatar: 'https://i.pravatar.cc/150?img=32',
        rating: 4,
        body: 'Beautiful storytelling and quick delivery. Highly recommend the cinematography package.',
        isApproved: false,
      },
    ]);
    console.log(`[seed-content] Testimonials: ${testimonials.length} items`);

    console.log('[seed-content] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed-content] Failed:', err.message);
    process.exit(1);
  }
})();
