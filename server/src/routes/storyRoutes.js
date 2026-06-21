const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/storyController');

// Public
router.get('/', c.listStorySections);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListStorySections);
router.post('/', protect, adminOnly, c.createStorySection);
router.put('/:id', protect, adminOnly, c.updateStorySection);
router.delete('/:id', protect, adminOnly, c.deleteStorySection);

module.exports = router;
