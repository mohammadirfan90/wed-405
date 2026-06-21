const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/videoController');

// Public
router.get('/', c.listVideos);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListVideos);
router.post('/', protect, adminOnly, c.createVideo);
router.put('/:id', protect, adminOnly, c.updateVideo);
router.delete('/:id', protect, adminOnly, c.deleteVideo);

module.exports = router;
