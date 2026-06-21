const Portfolio = require('../models/Portfolio');
const asyncHandler = require('../utils/asyncHandler');

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Public: list published items
const listPortfolio = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  const items = await Portfolio.find(filter).sort('-eventDate').populate('createdBy', 'name');
  res.json(items);
});

// Public: get one
const getPortfolio = asyncHandler(async (req, res) => {
  const item = await Portfolio.findById(req.params.id).populate('createdBy', 'name');
  if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
  res.json(item);
});

// Admin: list all
const adminListPortfolio = asyncHandler(async (req, res) => {
  const items = await Portfolio.find().sort('-createdAt');
  res.json(items);
});

// Admin: create
const createPortfolio = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = body.slug || slugify(body.title);
  if (req.user) body.createdBy = req.user._id;
  const item = await Portfolio.create(body);
  res.status(201).json(item);
});

// Admin: update
const updatePortfolio = asyncHandler(async (req, res) => {
  const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
  res.json(item);
});

// Admin: delete
const deletePortfolio = asyncHandler(async (req, res) => {
  const item = await Portfolio.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
  res.json({ message: 'Portfolio item deleted' });
});

module.exports = {
  listPortfolio, getPortfolio,
  adminListPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
};
