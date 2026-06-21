const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/adminController');

// Every endpoint here requires a logged-in admin.
router.use(protect, adminOnly);

// Stats — keep this ABOVE /:id so Express doesn't treat "stats" as an id.
router.get('/stats/summary', c.stats);

// CRUD
router.get('/', c.listAdmins);
router.get('/:id', c.getAdmin);
router.post('/', c.createAdmin);
router.patch('/:id', c.updateAdmin);
router.delete('/:id', c.deleteAdmin);

// Password rotation
router.post('/:id/change-password', c.changePassword);

module.exports = router;
