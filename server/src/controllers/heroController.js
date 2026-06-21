const HeroSlide = require('../models/HeroSlide');
const asyncHandler = require('../utils/asyncHandler');

// Public: List slides sorted by order
const listHeroSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find({}).sort('order');
  res.json(slides);
});

// Admin: List all
const adminListHeroSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find({}).sort('-createdAt');
  res.json(slides);
});

// Admin: Create
const createHeroSlide = asyncHandler(async (req, res) => {
  const { title, subtitle, image, order } = req.body;
  if (!image) return res.status(400).json({ message: 'Image URL is required' });

  const slide = await HeroSlide.create({
    title: String(title || '').trim(),
    subtitle: String(subtitle || '').trim(),
    image: String(image || '').trim(),
    order: Number(order) || 0,
  });
  res.status(201).json(slide);
});

// Admin: Update
const updateHeroSlide = asyncHandler(async (req, res) => {
  const { title, subtitle, image, order } = req.body;
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) return res.status(404).json({ message: 'Slide not found' });

  if (title !== undefined) slide.title = String(title || '').trim();
  if (subtitle !== undefined) slide.subtitle = String(subtitle || '').trim();
  if (image !== undefined) slide.image = String(image || '').trim();
  if (order !== undefined) slide.order = Number(order) || 0;

  await slide.save();
  res.json(slide);
});

// Admin: Delete
const deleteHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByIdAndDelete(req.params.id);
  if (!slide) return res.status(404).json({ message: 'Slide not found' });
  res.json({ message: 'Slide deleted' });
});

module.exports = {
  listHeroSlides,
  adminListHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
};
