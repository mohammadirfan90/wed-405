const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/categoryController');

router.get('/', c.listCategories);
router.post('/', protect, adminOnly, c.createCategory);
router.delete('/:id', protect, adminOnly, c.deleteCategory);

module.exports = router;
