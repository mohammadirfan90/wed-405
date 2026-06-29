const Content = require('../models/Content');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/content (public)
// Queries by section: story, home, about
const getContent = asyncHandler(async (req, res) => {
  const { section } = req.query;
  if (!section) {
    return res.status(400).json({ message: 'Section query parameter is required' });
  }

  if (!['story', 'home', 'about'].includes(section)) {
    return res.status(400).json({ message: 'Invalid section' });
  }

  if (section === 'home') {
    let content = await Content.findOne({ section: 'home' });
    if (!content) {
      content = await Content.create({
        section: 'home',
        data: {
          heroText: "Turning Your Forever Moments into Timeless Memories",
          bannerImage: "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
          introText: "Welcome to Wedding Heritage."
        }
      });
    }
    return res.json({ _id: content._id, section: content.section, ...content.data });
  }

  if (section === 'about') {
    let content = await Content.findOne({ section: 'about' });
    if (!content) {
      content = await Content.create({
        section: 'about',
        data: {
          bio: "Founded by passionate storytellers.",
          mission: "Capturing love the way it feels.",
          team: []
        }
      });
    }
    return res.json({ _id: content._id, section: content.section, ...content.data });
  }

  // story (returns array of items)
  const items = await Content.find({ section }).sort('data.order');
  return res.json(items.map(item => ({
    _id: item._id,
    section: item.section,
    ...item.data
  })));
});

// GET /api/content/admin/all (admin)
const adminGetContent = asyncHandler(async (req, res) => {
  const { section } = req.query;
  const filter = {};
  if (section) {
    if (!['story', 'home', 'about'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }
    filter.section = section;
  }

  const items = await Content.find(filter).sort('-createdAt');
  return res.json(items.map(item => ({
    _id: item._id,
    section: item.section,
    ...item.data
  })));
});

// POST /api/content (admin) — creates or upserts by section
const createOrUpsertContent = asyncHandler(async (req, res) => {
  const section = req.query.section || req.body.section;
  if (!section || !['story', 'home', 'about'].includes(section)) {
    return res.status(400).json({ message: 'Valid section query param or body field is required' });
  }

  // Extract payload
  const payload = { ...req.body };
  delete payload.section;

  if (section === 'home' || section === 'about') {
    // Upsert single document
    const content = await Content.findOneAndUpdate(
      { section },
      { section, data: payload },
      { new: true, upsert: true }
    );
    return res.json({ _id: content._id, section: content.section, ...content.data });
  }

  // Otherwise, create new item for story
  const content = await Content.create({
    section,
    data: payload
  });
  return res.status(201).json({ _id: content._id, section: content.section, ...content.data });
});

// PUT /api/content/:id (admin)
const updateContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  if (!content) {
    return res.status(404).json({ message: 'Content not found' });
  }

  const payload = { ...req.body };
  delete payload.section;

  content.data = { ...content.data, ...payload };
  await content.save();

  return res.json({ _id: content._id, section: content.section, ...content.data });
});

// DELETE /api/content/:id (admin)
const deleteContent = asyncHandler(async (req, res) => {
  const content = await Content.findByIdAndDelete(req.params.id);
  if (!content) {
    return res.status(404).json({ message: 'Content not found' });
  }
  return res.json({ message: 'Content deleted successfully' });
});

module.exports = {
  getContent,
  adminGetContent,
  createOrUpsertContent,
  updateContent,
  deleteContent
};
