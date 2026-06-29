require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');
const HeroSlide = require('../models/HeroSlide');
const Content = require('../models/Content');
const VideoItem = require('../models/VideoItem');
const Package = require('../models/Package');
const Gallery = require('../models/Gallery');
const Testimonial = require('../models/Testimonial');
const Service = require('../models/Service');
const Category = require('../models/Category');

// Idempotent admin seeder. Safe to run on every deploy — it never duplicates
// the admin and never downgrades a role. Prints a clear summary of the
// credentials it's about to use so the bootstrap story is auditable.
//
// Writes to the dedicated `admins` collection (chronos_moments.admins).
async function seedAdmin() {
  await connectDB();

  const username = (process.env.SEED_ADMIN_USERNAME || 'admin').trim();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.SEED_ADMIN_NAME || 'System Admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@chronosmoments.com';
  const phone = process.env.SEED_ADMIN_PHONE || '+8801700000000';

  console.log('[seed] Target database  :', require('mongoose').connection.name);
  console.log('[seed] Target collection:', Admin.collection.name);
  console.log('[seed] Admin username   :', username);

  let admin = await Admin.findOne({
    $or: [
      { username },
      { email }
    ]
  });
  if (admin) {
    let changed = false;
    if (!admin.isActive) {
      admin.isActive = true;
      changed = true;
    }
    if (!admin.isSuperAdmin) {
      admin.isSuperAdmin = true;
      changed = true;
    }
    if (admin.name !== name) {
      admin.name = name;
      changed = true;
    }
    if (admin.email !== email) {
      admin.email = email;
      changed = true;
    }
    if (admin.phone !== phone) {
      admin.phone = phone;
      changed = true;
    }
    if (admin.username !== username) {
      admin.username = username;
      changed = true;
    }
    if (changed) {
      await admin.save({ validateBeforeSave: false });
      console.log('[seed] Updated existing admin (id=' + admin._id + ').');
    } else {
      console.log('[seed] Admin already present (id=' + admin._id + '). No changes.');
    }
  } else {
    admin = await Admin.create({
      username,
      passwordHash: password, // Mongoose pre-save hashes this
      name,
      email,
      phone,
      role: 'admin',
      isSuperAdmin: true,
    });
    console.log('[seed] Created admin (id=' + admin._id + ').');
  }

  // Seed settings
  const defaultSettings = [
    { key: 'whatsapp_number', value: '+8801327292323' },
    { key: 'contact_email', value: 'info@weddingheritagebd.com' },
    { key: 'contact_phone', value: '01327292323' },
    { key: 'contact_address', value: 'Elephant Road, Dhaka, 1205' },
    { key: 'facebook_url', value: 'https://www.facebook.com/share/1BoURB3KeF/?mibextid=wwXIfr' },
    { key: 'instagram_url', value: 'https://www.instagram.com/weddingheritagebd?igsh=MmE0MGhxamx0cDc2&utm_source=qr' },
    { key: 'youtube_url', value: 'https://youtube.com/@weddingheritagebd?si=n5nB88292e6WXqa9' },
  ];
  for (const s of defaultSettings) {
    await Setting.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true });
  }
  console.log('[seed] Seeded settings.');

  // Seed default slides (compatibility)
  const slideCount = await HeroSlide.countDocuments();
  if (slideCount === 0) {
    await HeroSlide.create([
      {
        title: "Turning Your Forever Moments into Timeless Memories",
        subtitle: "At Wedding Heritage, we bring your wedding story to life with stunning imagery and heartfelt storytelling.",
        image: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
        order: 1,
      },
      {
        title: "Capturing Love the Way It Feels",
        subtitle: "From candid glances to grand celebrations, our team is dedicated to turning your special moments into unforgettable legacies.",
        image: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01-1-scaled.jpg",
        order: 2,
      },
      {
        title: "Unfiltered, Elegant, and Truly Yours",
        subtitle: "We preserve your memories with artistry, elegance, and meticulous attention to detail.",
        image: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC06887-1-scaled.jpg",
        order: 3,
      },
    ]);
    console.log('[seed] Seeded default Hero Slides.');
  }

  // Seed default story sections (compatibility)
  const storyCount = await Content.countDocuments({ section: 'story' });
  if (storyCount === 0) {
    await Content.create([
      {
        section: 'story',
        data: {
          title: "Welcome To Wedding Heritage",
          body: "At Wedding Heritage, we believe that every love story is unique and deserves to be celebrated in its truest form. From intimate moments to grand celebrations, we are dedicated to capturing the joy, laughter, and love that make your wedding day unforgettable.\n\nFounded by passionate storytellers, our mission is to preserve your memories with artistry, elegance, and attention to detail. Each photograph and video we create is a testament to the emotions and stories that unfold on your special day.",
          image: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC03273-scaled.jpg",
          order: 1,
        }
      },
    ]);
    console.log('[seed] Seeded default Story Sections.');
  }

  // Seed default cinematography videos (compatibility)
  const videoCount = await VideoItem.countDocuments();
  if (videoCount === 0) {
    await VideoItem.create([
      {
        youtubeUrl: "https://www.youtube.com/watch?v=gaALPSaW7bA",
        title: "Wedding Cinematography Highlight",
        order: 1,
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=7borAdo4JYY",
        title: "Pre-Wedding Cinematic Film",
        order: 2,
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=7gWhrpa2R0o",
        title: "Reception Cinematic Story",
        order: 3,
      },
    ]);
    console.log('[seed] Seeded default YouTube Videos.');
  }

  // Seed default packages
  const packageCount = await Package.countDocuments();
  if (packageCount === 0) {
    await Package.create([
      {
        title: "Standard Package",
        slug: "standard-package",
        category: "Wedding",
        price: 35000,
        duration: "6 Hours",
        description: "Great value wedding photography.",
        features: ["1 Senior Photographer", "1 Associate Photographer", "100 Edited Photos", "All Raw Photos Provided"],
        coverImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
      },
      {
        title: "Premium Package",
        slug: "premium-package",
        category: "Wedding",
        price: 65000,
        duration: "Full Day",
        description: "Comprehensive wedding coverage.",
        features: ["1 Chief Photographer", "2 Senior Photographers", "200 Edited Photos", "Premium Photo Book", "All Raw Photos"],
        coverImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01-1-scaled.jpg",
      },
      {
        title: "Signature Package",
        slug: "signature-package",
        category: "Wedding",
        price: 95000,
        duration: "Full Day + Pre-Wedding",
        description: "Ultimate luxury photography & cinematography package.",
        features: ["Chief Photographer & Team", "3 Senior Photographers", "Pre-Wedding Shoot", "Premium Photo Book + Framed Print", "All Raw Photos"],
        coverImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC06887-1-scaled.jpg",
      }
    ]);
    console.log('[seed] Seeded default Packages.');
  }

  // Seed default gallery items
  const galleryCount = await Gallery.countDocuments();
  if (galleryCount === 0) {
    await Gallery.create([
      {
        title: "Tasnim & Milon's Majestic Wedding",
        slug: "tasnim-milon-wedding",
        category: "Wedding",
        url: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
        coverImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
        images: [
          "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
          "https://weddingheritagebd.com/wp-content/uploads/2026/02/01-1-scaled.jpg"
        ],
        description: "A gorgeous luxury wedding at Sena Malancha.",
        eventDate: new Date(),
        location: "Sena Malancha, Dhaka",
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Romantic Pre-Wedding at Dhanmondi Lake",
        slug: "dhanmondi-lake-pre-wedding",
        category: "Pre-Wedding",
        url: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC06887-1-scaled.jpg",
        coverImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC06887-1-scaled.jpg",
        images: [
          "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC06887-1-scaled.jpg"
        ],
        description: "Candid love stories under the sunset.",
        eventDate: new Date(),
        location: "Dhanmondi, Dhaka",
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Zara & Abrar's Engagement",
        slug: "zara-abrar-engagement",
        category: "Engagement",
        url: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC03273-scaled.jpg",
        coverImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC03273-scaled.jpg",
        images: [
          "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC03273-scaled.jpg"
        ],
        description: "An intimate rooftop engagement ceremony.",
        eventDate: new Date(),
        location: "Gulshan, Dhaka",
        isPublished: true,
        isFeatured: true,
      }
    ]);
    console.log('[seed] Seeded default Gallery items.');
  }

  // Seed default testimonials
  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.create([
      {
        authorName: "Anika & Fahim",
        role: "Bride & Groom",
        rating: 5,
        body: "Wedding Heritage turned our wedding into a fairy tale. The photos and cinematographic reels captured the raw emotions perfectly. We highly recommend them!",
        isApproved: true,
      },
      {
        authorName: "Tanvir Rahman",
        role: "Groom",
        rating: 5,
        body: "Exceptional quality and highly professional team. The signature book they delivered is a masterpiece. Worth every BDT!",
        isApproved: true,
      }
    ]);
    console.log('[seed] Seeded default Testimonials.');
  }

  // Seed Home Content (Spec)
  const homeContentCount = await Content.countDocuments({ section: 'home' });
  if (homeContentCount === 0) {
    await Content.create({
      section: 'home',
      data: {
        heroText: "Turning Your Forever Moments into Timeless Memories",
        bannerImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
        introText: "At Wedding Heritage, we bring your wedding story to life with stunning imagery and heartfelt storytelling."
      }
    });
    console.log('[seed] Seeded default Home Content.');
  }

  // Seed About Content (Spec)
  const aboutContentCount = await Content.countDocuments({ section: 'about' });
  if (aboutContentCount === 0) {
    await Content.create({
      section: 'about',
      data: {
        bio: "At Wedding Heritage, we believe that every love story is unique and deserves to be celebrated in its truest form. Founded by passionate storytellers, our mission is to preserve your memories with artistry, elegance, and attention to detail.",
        mission: "Capturing love the way it feels, preserved with artistry and elegance.",
        team: ["Irfan (Lead Photographer)", "Milon (Lead Cinematographer)", "Zara (Visual Artist)"]
      }
    });
    console.log('[seed] Seeded default About Content.');
  }

  // Seed Services (Spec)
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.create([
      { name: "Pre Wedding Photography", description: "Romantic couple shoots under the sunset.", price: 15000 },
      { name: "Holud & Mehendi photography", description: "Capturing colorful traditions and emotions.", price: 20000 },
      { name: "Wedding Day Photography", description: "High-end luxury wedding portraiture.", price: 35000 },
      { name: "Reception Cinematography", description: "Cinematic teasers and full-length wedding films.", price: 40000 }
    ]);
    console.log('[seed] Seeded default Services.');
  }

  // Seed Categories (Spec)
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    await Category.create([
      { name: "Wedding" },
      { name: "Pre-Wedding" },
      { name: "Engagement" },
      { name: "Event" }
    ]);
    console.log('[seed] Seeded default Categories.');
  }

  return admin;
}

seedAdmin()
  .then((admin) => {
    console.log('');
    console.log('============================================================');
    console.log('  Chronos Moments — admin bootstrap complete');
    console.log('============================================================');
    console.log('  DB:       ' + require('mongoose').connection.name);
    console.log('  Coll:     ' + Admin.collection.name);
    console.log('  Username: ' + admin.username);
    console.log('  Password: ' + (process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'));
    console.log('  Role:     ' + admin.role + (admin.isSuperAdmin ? ' (super)' : ''));
    console.log('------------------------------------------------------------');
    console.log('  Sign in at: http://localhost:5173/admin/login');
    console.log('  Change the password from the admin console after first login.');
    console.log('============================================================');
    return require('mongoose').disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] FAILED:', err.message);
    if (err.code === 11000) {
      console.error('[seed] Hint: a record with that key already exists in the DB.');
    }
    process.exit(1);
  });
