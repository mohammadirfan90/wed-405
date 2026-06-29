const Gallery = require('../models/Gallery');
const asyncHandler = require('../utils/asyncHandler');

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Public: list published items
const listGallery = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  const items = await Gallery.find(filter).sort('-eventDate').populate('createdBy', 'name');
  res.json(items);
});

// Public: get one
const getGallery = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id).populate('createdBy', 'name');
  if (!item) return res.status(404).json({ message: 'Gallery item not found' });
  res.json(item);
});

// Admin: list all
const adminListGallery = asyncHandler(async (req, res) => {
  const items = await Gallery.find().sort('-createdAt');
  res.json(items);
});

// Admin: create
const createGallery = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = body.slug || slugify(body.title);
  body.url = body.url || body.coverImage || '';
  body.coverImage = body.coverImage || body.url || '';
  if (req.user) body.createdBy = req.user._id;
  const item = await Gallery.create(body);
  res.status(201).json(item);
});

// Admin: update
const updateGallery = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.url || body.coverImage) {
    body.url = body.url || body.coverImage;
    body.coverImage = body.coverImage || body.url;
  }
  const item = await Gallery.findByIdAndUpdate(req.params.id, body, {
    new: true, runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Gallery item not found' });
  res.json(item);
});

// Admin: delete
const deleteGallery = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Gallery item not found' });
  res.json({ message: 'Gallery item deleted' });
});

module.exports = {
  listGallery, getGallery,
  adminListGallery, createGallery, updateGallery, deleteGallery,
};
