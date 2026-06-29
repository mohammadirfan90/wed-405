const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 80 },
    email:   { type: String, required: true, trim: true, lowercase: true,
               match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    phone:   { type: String, default: '' },
    subject: { type: String, default: '', maxlength: 140 },
    message: { type: String, required: true, maxlength: 4000 },
    isRead:  { type: Boolean, default: false },
    readAt:  { type: Date },
    status:  { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
  },
  { timestamps: true }
);

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
