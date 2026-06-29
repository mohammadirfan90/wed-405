const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/galleryController');

// Public
router.get('/', c.listGallery);
router.get('/:id', c.getGallery);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListGallery);
router.post('/', protect, adminOnly, c.createGallery);
router.put('/:id', protect, adminOnly, c.updateGallery);
router.delete('/:id', protect, adminOnly, c.deleteGallery);

module.exports = router;
