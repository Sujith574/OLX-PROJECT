const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markOneAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAsRead);
router.put('/:id/read', markOneAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
