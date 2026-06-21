const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/testimonialController');

// Public
router.get('/', c.listTestimonials);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListTestimonials);
router.post('/', protect, adminOnly, c.createTestimonial);
router.put('/:id', protect, adminOnly, c.updateTestimonial);
router.delete('/:id', protect, adminOnly, c.deleteTestimonial);

module.exports = router;
