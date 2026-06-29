const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');
const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalBookings, pendingBookings, totalContacts, totalPackages] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    ContactMessage.countDocuments(),
    Package.countDocuments(),
  ]);

  res.json({
    totalBookings,
    pendingBookings,
    totalContacts,
    totalPackages,
  });
});

module.exports = {
  getDashboardStats,
};
