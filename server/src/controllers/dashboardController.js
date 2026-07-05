const Booking = require('../models/Booking');
const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalBookings, pendingBookings, totalPackages] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Package.countDocuments(),
  ]);

  res.json({
    totalBookings,
    pendingBookings,
    totalPackages,
  });
});

module.exports = {
  getDashboardStats,
};
