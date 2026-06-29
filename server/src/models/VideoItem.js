const mongoose = require('mongoose');

const videoItemSchema = new mongoose.Schema(
  {
    youtubeUrl: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VideoItem', videoItemSchema);
