const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/adminController');

// Every endpoint here requires a logged-in admin.
router.use(protect, adminOnly);

// CRUD
router.patch('/:id', c.updateAdmin);

// Password rotation
router.post('/:id/change-password', c.changePassword);

module.exports = router;
