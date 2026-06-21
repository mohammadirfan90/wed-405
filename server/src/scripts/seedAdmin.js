require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');
const HeroSlide = require('../models/HeroSlide');
const StorySection = require('../models/StorySection');
const VideoItem = require('../models/VideoItem');

// Idempotent admin seeder. Safe to run on every deploy — it never duplicates
// the admin and never downgrades a role. Prints a clear summary of the
// credentials it's about to use so the bootstrap story is auditable.
//
// Writes to the dedicated `admins` collection (chronos_moments.admins).
async function seedAdmin() {
  await connectDB();

  const phone = (process.env.SEED_ADMIN_PHONE || '+8801700000000').trim();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.SEED_ADMIN_NAME || 'Chronos Admin';
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim() || undefined;

  console.log('[seed] Target database  :', require('mongoose').connection.name);
  console.log('[seed] Target collection:', Admin.collection.name);
  console.log('[seed] Admin phone      :', phone);
  console.log('[seed] Admin email      :', email || '(none)');

  let admin = await Admin.findOne({ phone });
  if (admin) {
    let changed = false;
    if (email && admin.email !== email) {
      admin.email = email;
      changed = true;
    }
    if (admin.name !== name) {
      admin.name = name;
      changed = true;
    }
    if (!admin.isActive) {
      admin.isActive = true;
      changed = true;
    }
    if (!admin.isSuperAdmin) {
      admin.isSuperAdmin = true;
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
      name,
      phone,
      email,
      password,
      role: 'admin',
      isSuperAdmin: true,
      mustChangePassword: true,
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

  // Seed default slides
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

  // Seed default story sections
  const storyCount = await StorySection.countDocuments();
  if (storyCount === 0) {
    await StorySection.create([
      {
        title: "Welcome To Wedding Heritage",
        body: "At Wedding Heritage, we believe that every love story is unique and deserves to be celebrated in its truest form. From intimate moments to grand celebrations, we are dedicated to capturing the joy, laughter, and love that make your wedding day unforgettable.\n\nFounded by passionate storytellers, our mission is to preserve your memories with artistry, elegance, and attention to detail. Each photograph and video we create is a testament to the emotions and stories that unfold on your special day.",
        image: "https://weddingheritagebd.com/wp-content/uploads/2026/02/DSC03273-scaled.jpg",
        order: 1,
      },
    ]);
    console.log('[seed] Seeded default Story Sections.');
  }

  // Seed default cinematography videos
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
    console.log('  Name:     ' + admin.name);
    console.log('  Phone:    ' + admin.phone);
    console.log('  Email:    ' + (admin.email || '(none)'));
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
      console.error('[seed] Hint: a user with that phone/email already exists in this DB.');
    }
    process.exit(1);
  });
