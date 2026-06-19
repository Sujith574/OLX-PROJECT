const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * @desc    Get or create conversation between two users about an item
 * @route   POST /api/messages/conversation
 * @access  Protected
 */
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { participantId, itemId } = req.body;
    const userId = req.user._id;

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      item: itemId,
    }).populate('participants', 'name avatar').populate('item', 'title imageUrl');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
        item: itemId,
      });
      await conversation.populate('participants', 'name avatar');
      await conversation.populate('item', 'title imageUrl');
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) { next(error); }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Protected
 */
const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('item', 'title imageUrl')
      .sort('-lastMessageAt');

    res.status(200).json({ success: true, conversations });
  } catch (error) { next(error); }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Protected
 */
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    // Ensure user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name avatar')
      .sort('createdAt')
      .skip(skip)
      .limit(limit);

    // Mark as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) { next(error); }
};

/**
 * @desc    Send a message
 * @route   POST /api/messages/:conversationId
 * @access  Protected
 */
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    if (!conversation.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const message = await Message.create({
      conversationId: req.params.conversationId,
      senderId: req.user._id,
      content,
    });

    // Update conversation
    conversation.lastMessage = content.substring(0, 100);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate('senderId', 'name avatar');

    // Emit socket event to other participant
    if (req.io) {
      const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== req.user._id.toString()
      );
      req.io.to(otherParticipant.toString()).emit('new_message', {
        conversationId: req.params.conversationId,
        message,
      });
    }

    res.status(201).json({ success: true, message });
  } catch (error) { next(error); }
};

module.exports = { getOrCreateConversation, getMyConversations, getMessages, sendMessage };
