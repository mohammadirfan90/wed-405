const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/packageController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', ctrl.listPackages);
router.get('/:id', ctrl.getPackage);

// Admin
router.get('/admin/all', protect, adminOnly, ctrl.adminListPackages);
router.post('/', protect, adminOnly, ctrl.createPackage);
router.put('/:id', protect, adminOnly, ctrl.updatePackage);
router.delete('/:id', protect, adminOnly, ctrl.deletePackage);

module.exports = router;
