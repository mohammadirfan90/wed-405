const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Public: list published posts
const listBlogs = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.tag) filter.tags = req.query.tag;
  const posts = await Blog.find(filter)
    .sort('-publishedAt')
    .populate('author', 'name');
  res.json(posts);
});

// Public: get one by id
const getBlog = asyncHandler(async (req, res) => {
  const post = await Blog.findById(req.params.id).populate('author', 'name');
  if (!post || !post.isPublished) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(post);
});

// Admin: list all
const adminListBlogs = asyncHandler(async (req, res) => {
  const posts = await Blog.find().sort('-createdAt').populate('author', 'name');
  res.json(posts);
});

// Admin: create
const createBlog = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = body.slug || slugify(body.title);
  if (req.user) body.author = req.user._id;
  if (body.isPublished && !body.publishedAt) body.publishedAt = new Date();
  const post = await Blog.create(body);
  res.status(201).json(post);
});

// Admin: update
const updateBlog = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.isPublished === true) {
    const existing = await Blog.findById(req.params.id);
    if (existing && !existing.publishedAt) body.publishedAt = new Date();
  }
  const post = await Blog.findByIdAndUpdate(req.params.id, body, {
    new: true, runValidators: true,
  });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// Admin: delete
const deleteBlog = asyncHandler(async (req, res) => {
  const post = await Blog.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ message: 'Post deleted' });
});

module.exports = {
  listBlogs, getBlog,
  adminListBlogs, createBlog, updateBlog, deleteBlog,
};
