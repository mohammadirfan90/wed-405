const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const cat = await Category.create({ name });
  res.status(201).json(cat);
});

const listCategories = asyncHandler(async (req, res) => {
  const cats = await Category.find({});
  res.json(cats);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category deleted successfully' });
});

module.exports = { createCategory, listCategories, deleteCategory };
