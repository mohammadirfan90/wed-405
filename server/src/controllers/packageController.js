const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Public: list active packages
const listPackages = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.isActive = req.query.status === 'active';
  } else {
    filter.isActive = true;
  }

  if (req.query.category) {
    filter.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
  }

  const packages = await Package.find(filter).sort('-createdAt');
  res.json(packages);
});

// Public: get one package
const getPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.status(404).json({ message: 'Package not found' });
  res.json(pkg);
});

// Admin: create
const createPackage = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = body.slug || slugify(body.title);
  const pkg = await Package.create(body);
  res.status(201).json(pkg);
});

// Admin: update
const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!pkg) return res.status(404).json({ message: 'Package not found' });
  res.json(pkg);
});

// Admin: delete
const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);
  if (!pkg) return res.status(404).json({ message: 'Package not found' });
  res.json({ message: 'Package deleted' });
});

// Admin: list all (including inactive)
const adminListPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find().sort('-createdAt');
  res.json(packages);
});

module.exports = {
  listPackages, getPackage,
  createPackage, updatePackage, deletePackage, adminListPackages,
};
