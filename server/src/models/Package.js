const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Wedding', 'Cinematography', 'Pre-Wedding', 'Engagement', 'Event', 'Custom', 'Holud'],
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT', uppercase: true },
    duration: { type: String, default: '' }, // e.g. "Full day", "6 hours"
    description: { type: String, default: '', maxlength: 2000 },
    features: [{ type: String }], // bullet list
    coverImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
