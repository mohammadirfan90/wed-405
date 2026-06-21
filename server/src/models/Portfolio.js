const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Wedding', 'Pre-Wedding', 'Engagement', 'Event', 'Cinematography', 'Other'],
    },
    coverImage: { type: String, default: '' },
    images: [{ type: String }],            // gallery image URLs
    description: { type: String, default: '', maxlength: 2000 },
    eventDate: { type: Date },
    location: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

portfolioSchema.index({ category: 1, isPublished: 1, eventDate: -1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
