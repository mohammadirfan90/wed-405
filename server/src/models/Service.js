const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: 'services' }
);

module.exports = mongoose.model('Service', serviceSchema);
