const Booking = require('../models/Booking');
const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');
const { normalizePhone } = require('../utils/phone');

// User: create a booking
const createBooking = asyncHandler(async (req, res) => {
  const { packageId, eventDate, venue, guests, notes, contactPhone, contactEmail } = req.body;
  if (!packageId || !eventDate || !venue || !contactPhone) {
    return res.status(400).json({ message: 'packageId, eventDate, venue and contactPhone are required' });
  }
  const pkg = await Package.findById(packageId);
  if (!pkg || !pkg.isActive) return res.status(404).json({ message: 'Package not available' });

  const booking = await Booking.create({
    user: req.user ? req.user._id : undefined,
    package: pkg._id,
    eventDate,
    venue,
    guests,
    notes,
    contactPhone: normalizePhone(contactPhone),
    contactEmail,
  });
  res.status(201).json(booking);
});

// User: my bookings
const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('package', 'title price currency category coverImage')
    .sort('-createdAt');
  res.json(bookings);
});

// User: cancel own booking (only if pending)
const cancelMyBooking = asyncHandler(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  if (b.status !== 'pending') return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
  b.status = 'cancelled';
  await b.save();
  res.json(b);
});

// Admin: list all bookings
const adminListBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const bookings = await Booking.find(filter)
    .populate('user', 'name phone email')
    .populate('package', 'title price currency')
    .sort('-createdAt');
  res.json(bookings);
});

// Admin: update status
const adminUpdateBooking = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  if (status) b.status = status;
  await b.save();
  res.json(b);
});

module.exports = {
  createBooking, myBookings, cancelMyBooking,
  adminListBookings, adminUpdateBooking,
};
