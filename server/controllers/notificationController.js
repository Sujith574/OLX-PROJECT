const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(20);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
};

const markOneAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markOneAsRead, deleteNotification };
