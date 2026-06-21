const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    role:       { type: String, default: '', maxlength: 80 }, // e.g. "Bride", "Groom"
    avatar:     { type: String, default: '' },
    rating:     { type: Number, required: true, min: 1, max: 5, default: 5 },
    body:       { type: String, required: true, maxlength: 1000 },
    package:    { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

testimonialSchema.index({ isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
