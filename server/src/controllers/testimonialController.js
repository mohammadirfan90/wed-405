const Testimonial = require('../models/Testimonial');
const asyncHandler = require('../utils/asyncHandler');

// Public: list approved testimonials
const listTestimonials = asyncHandler(async (req, res) => {
  const items = await Testimonial.find({ isApproved: true })
    .sort('-createdAt')
    .populate('package', 'title slug');
  res.json(items);
});

// Admin: list all
const adminListTestimonials = asyncHandler(async (req, res) => {
  const items = await Testimonial.find().sort('-createdAt');
  res.json(items);
});

// Admin: create
const createTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.create(req.body);
  res.status(201).json(item);
});

// Admin: update
const updateTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Testimonial not found' });
  res.json(item);
});

// Admin: delete
const deleteTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Testimonial not found' });
  res.json({ message: 'Testimonial deleted' });
});

module.exports = {
  listTestimonials,
  adminListTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
};
