const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/contactController');

// Public
router.post('/', c.createContactMessage);

// Admin
router.get('/', protect, adminOnly, c.adminListMessages);
router.patch('/:id/status', protect, adminOnly, c.updateMessageStatus);
router.delete('/:id', protect, adminOnly, c.deleteMessage);

module.exports = router;
