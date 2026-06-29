const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getContent,
  adminGetContent,
  createOrUpsertContent,
  updateContent,
  deleteContent
} = require('../controllers/contentController');

// Public GET list / item
router.get('/', getContent);

// Admin-only endpoints
router.get('/admin/all', protect, adminOnly, adminGetContent);
router.post('/', protect, adminOnly, createOrUpsertContent);
router.put('/:id', protect, adminOnly, updateContent);
router.delete('/:id', protect, adminOnly, deleteContent);

module.exports = router;
