const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/portfolioController');

// Public
router.get('/', c.listPortfolio);
router.get('/:id', c.getPortfolio);

// Admin
router.get('/admin/all', protect, adminOnly, c.adminListPortfolio);
router.post('/', protect, adminOnly, c.createPortfolio);
router.put('/:id', protect, adminOnly, c.updatePortfolio);
router.delete('/:id', protect, adminOnly, c.deletePortfolio);

module.exports = router;
