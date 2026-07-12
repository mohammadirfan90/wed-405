const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    guests: { type: Number, min: 1 },
    notes: { type: String, default: '', maxlength: 1000 },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+[1-9]\d{6,14}$/, 'Phone must be in international format'],
    },
    contactEmail: { type: String, trim: true, lowercase: true },
    bookingId: { type: String, unique: true },
    googleDriveLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
