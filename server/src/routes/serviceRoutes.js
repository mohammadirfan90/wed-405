const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/serviceController');

router.get('/', c.listServices);
router.get('/:id', c.getService);
router.post('/', protect, adminOnly, c.createService);
router.put('/:id', protect, adminOnly, c.updateService);
router.delete('/:id', protect, adminOnly, c.deleteService);

module.exports = router;
