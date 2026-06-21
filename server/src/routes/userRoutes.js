const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { listUsers, getUser, updateUser, deactivateUser } = require('../controllers/userController');

// Admin: list users
router.get('/', protect, adminOnly, asyncHandler(listUsers));

// Admin: get one user
router.get('/:id', protect, adminOnly, asyncHandler(getUser));

// Admin: update role / active status
router.patch('/:id', protect, adminOnly, asyncHandler(updateUser));

// Admin: deactivate (soft delete)
router.delete('/:id', protect, adminOnly, asyncHandler(deactivateUser));

module.exports = router;
