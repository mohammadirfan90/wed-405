const StorySection = require('../models/StorySection');
const asyncHandler = require('../utils/asyncHandler');

// Public: List story sections sorted by order
const listStorySections = asyncHandler(async (req, res) => {
  const sections = await StorySection.find({}).sort('order');
  res.json(sections);
});

// Admin: List all
const adminListStorySections = asyncHandler(async (req, res) => {
  const sections = await StorySection.find({}).sort('-createdAt');
  res.json(sections);
});

// Admin: Create
const createStorySection = asyncHandler(async (req, res) => {
  const { title, body, image, order } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: 'Title and Body are required' });
  }

  const section = await StorySection.create({
    title: String(title).trim(),
    body: String(body).trim(),
    image: String(image || '').trim(),
    order: Number(order) || 0,
  });
  res.status(201).json(section);
});

// Admin: Update
const updateStorySection = asyncHandler(async (req, res) => {
  const { title, body, image, order } = req.body;
  const section = await StorySection.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Story section not found' });

  if (title !== undefined) section.title = String(title).trim();
  if (body !== undefined) section.body = String(body).trim();
  if (image !== undefined) section.image = String(image || '').trim();
  if (order !== undefined) section.order = Number(order) || 0;

  await section.save();
  res.json(section);
});

// Admin: Delete
const deleteStorySection = asyncHandler(async (req, res) => {
  const section = await StorySection.findByIdAndDelete(req.params.id);
  if (!section) return res.status(404).json({ message: 'Story section not found' });
  res.json({ message: 'Story section deleted' });
});

module.exports = {
  listStorySections,
  adminListStorySections,
  createStorySection,
  updateStorySection,
  deleteStorySection,
};
