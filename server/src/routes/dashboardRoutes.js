const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// All endpoints in this file require authentication and admin role
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);

module.exports = router;
