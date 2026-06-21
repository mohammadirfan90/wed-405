const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');

// User routes
router.post('/', optionalProtect, ctrl.createBooking);
router.get('/mine', protect, ctrl.myBookings);
router.patch('/:id/cancel', protect, ctrl.cancelMyBooking);

// Admin routes
router.get('/', protect, adminOnly, ctrl.adminListBookings);
router.patch('/:id', protect, adminOnly, ctrl.adminUpdateBooking);

module.exports = router;
