const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/settingController');

// Public
router.get('/', c.listSettings);

// Admin
router.post('/', protect, adminOnly, c.updateSetting);

module.exports = router;
