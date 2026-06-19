const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, updateItem, deleteItem, getMyItems, getFeaturedItems } = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { uploadItem } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.get('/featured', getFeaturedItems);
router.get('/my', protect, getMyItems);
router.get('/', getItems);
router.post('/', protect, uploadLimiter, uploadItem.single('image'), createItem);
router.get('/:id', getItemById);
router.put('/:id', protect, uploadItem.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
