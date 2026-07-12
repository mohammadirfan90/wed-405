const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Counter = require('../models/Counter');
const asyncHandler = require('../utils/asyncHandler');
const { normalizePhone } = require('../utils/phone');
const { sendEmail } = require('../utils/email');

// User: create a booking
const createBooking = asyncHandler(async (req, res) => {
  const { packageId, eventDate, venue, guests, notes, contactPhone, contactEmail } = req.body;
  if (!packageId || !eventDate || !venue || !contactPhone) {
    return res.status(400).json({ message: 'packageId, eventDate, venue and contactPhone are required' });
  }
  const pkg = await Package.findById(packageId);
  if (!pkg || !pkg.isActive) return res.status(404).json({ message: 'Package not available' });

  // Get next sequential booking ID
  const counter = await Counter.findOneAndUpdate(
    { id: 'bookingId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const bookingId = `BB-${1000 + counter.seq}`;

  const booking = await Booking.create({
    user: req.user ? req.user._id : undefined,
    package: pkg._id,
    bookingId,
    eventDate,
    venue,
    guests,
    notes,
    contactPhone: normalizePhone(contactPhone),
    contactEmail,
  });
  res.status(201).json(booking);
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

// Admin: update status & googleDriveLink
const adminUpdateBooking = asyncHandler(async (req, res) => {
  const { status, googleDriveLink } = req.body;
  const b = await Booking.findById(req.params.id).populate('package');
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  
  const oldStatus = b.status;
  if (status) b.status = status;
  if (googleDriveLink !== undefined) b.googleDriveLink = googleDriveLink;
  
  await b.save();

  // If status is updated to 'approved' (confirmed), send email notification
  if (status === 'approved' && oldStatus !== 'approved' && b.contactEmail) {
    const formattedDate = new Date(b.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await sendEmail({
      to: b.contactEmail,
      subject: `Booking Confirmed! - Reference: ${b.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0b0a0c; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Booking Confirmed 🎉</h2>
          <p>Dear Customer,</p>
          <p>We are delighted to inform you that your booking request has been confirmed by our team.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background-color: #f7fafc;">
              <td style="padding: 8px; font-weight: bold; border: 1px solid #edf2f7; width: 30%;">Booking ID</td>
              <td style="padding: 8px; border: 1px solid #edf2f7;">${b.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #edf2f7;">Package</td>
              <td style="padding: 8px; border: 1px solid #edf2f7;">${b.package?.title || 'Selected Package'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 8px; font-weight: bold; border: 1px solid #edf2f7;">Event Date</td>
              <td style="padding: 8px; border: 1px solid #edf2f7;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #edf2f7;">Venue</td>
              <td style="padding: 8px; border: 1px solid #edf2f7;">${b.venue}</td>
            </tr>
          </table>
          
          <p style="margin-top: 20px;">You can track your booking status anytime at: <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/track-booking" style="color: #D4AF37; font-weight: bold; text-decoration: none;">Track Booking Status</a></p>
          
          <p style="margin-top: 25px; font-size: 0.9em; color: #718096;">Thank you for choosing BiyeBuzz.com!<br/>If you have any questions, feel free to reply to this email.</p>
        </div>
      `
    });
  }

  // If status is updated to 'completed', send email with Google Drive Link
  if (status === 'completed' && oldStatus !== 'completed' && b.contactEmail) {
    await sendEmail({
      to: b.contactEmail,
      subject: `Your Photos/Videos are Ready! - Reference: ${b.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0b0a0c; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Photos & Videos Delivered 📸🎥</h2>
          <p>Dear Customer,</p>
          <p>Great news! Your wedding photos and videos have been successfully processed and delivered.</p>
          
          <p>You can access your Google Drive delivery link below:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${b.googleDriveLink || '#'}" target="_blank" style="background-color: #2b6cb0; color: white; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">Access Google Drive Link</a>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background-color: #f7fafc;">
              <td style="padding: 8px; font-weight: bold; border: 1px solid #edf2f7; width: 30%;">Booking ID</td>
              <td style="padding: 8px; border: 1px solid #edf2f7;">${b.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #edf2f7;">Google Drive Link</td>
              <td style="padding: 8px; border: 1px solid #edf2f7;"><a href="${b.googleDriveLink || '#'}" target="_blank">${b.googleDriveLink || 'Link not set'}</a></td>
            </tr>
          </table>
          
          <p style="margin-top: 20px;">You can also track your booking details at: <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/track-booking" style="color: #D4AF37; font-weight: bold; text-decoration: none;">Track Booking Status</a></p>
          
          <p style="margin-top: 25px; font-size: 0.9em; color: #718096;">Thank you for choosing BiyeBuzz.com!<br/>If you have any questions, feel free to reply to this email.</p>
        </div>
      `
    });
  }

  res.json(b);
});

// Public: track a booking
const trackBooking = asyncHandler(async (req, res) => {
  const { bookingId, phone } = req.query;
  if (!bookingId || !phone) {
    return res.status(400).json({ message: 'bookingId and phone query parameters are required' });
  }

  // Normalize phone for lookup
  const cleanPhone = normalizePhone(phone);

  const booking = await Booking.findOne({
    bookingId: String(bookingId).trim().toUpperCase(),
    contactPhone: cleanPhone,
  }).populate('package', 'title price currency');

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found with the provided ID and phone number' });
  }

  res.json(booking);
});

module.exports = {
  createBooking,
  adminListBookings,
  adminUpdateBooking,
  trackBooking,
};
