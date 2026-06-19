const express = require('express');
const router = express.Router();
const { getOrCreateConversation, getMyConversations, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getMyConversations);
router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);

module.exports = router;
