const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

// Public: anyone can submit a contact form
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email and message are required' });
  }
  const doc = await ContactMessage.create({ name, email, phone, subject, message });
  res.status(201).json({ message: 'Message sent. We will be in touch soon.', id: doc._id });
});

// Admin: list messages
const adminListMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.unread === 'true') filter.isRead = false;
  const messages = await ContactMessage.find(filter).sort('-createdAt');
  res.json(messages);
});

// Admin: mark read/unread
const updateMessage = asyncHandler(async (req, res) => {
  const update = {};
  if (typeof req.body.isRead === 'boolean') {
    update.isRead = req.body.isRead;
    update.readAt = req.body.isRead ? new Date() : null;
  }
  const doc = await ContactMessage.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!doc) return res.status(404).json({ message: 'Message not found' });
  res.json(doc);
});

// Admin: delete
const deleteMessage = asyncHandler(async (req, res) => {
  const doc = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Message not found' });
  res.json({ message: 'Message deleted' });
});

module.exports = {
  createContactMessage,
  adminListMessages, updateMessage, deleteMessage,
};
