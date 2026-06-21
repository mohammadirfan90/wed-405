const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/heroController');

// Public
router.get('/', c.listHeroSlides);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListHeroSlides);
router.post('/', protect, adminOnly, c.createHeroSlide);
router.put('/:id', protect, adminOnly, c.updateHeroSlide);
router.delete('/:id', protect, adminOnly, c.deleteHeroSlide);

module.exports = router;
