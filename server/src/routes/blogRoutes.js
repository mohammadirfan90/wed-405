const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/blogController');

// Public
router.get('/', c.listBlogs);
router.get('/:id', c.getBlog);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListBlogs);
router.post('/', protect, adminOnly, c.createBlog);
router.put('/:id', protect, adminOnly, c.updateBlog);
router.delete('/:id', protect, adminOnly, c.deleteBlog);

module.exports = router;
