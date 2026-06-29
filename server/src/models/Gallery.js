const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
    },
    url: { type: String, required: true, trim: true }, // Exact spec field
    coverImage: { type: String, default: '' }, // Frontend compatibility
    images: [{ type: String }],            // Frontend compatibility
    description: { type: String, default: '', maxlength: 2000 },
    eventDate: { type: Date },
    location: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'galleries' }
);

gallerySchema.index({ category: 1, isPublished: 1, eventDate: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
