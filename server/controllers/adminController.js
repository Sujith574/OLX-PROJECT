const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Report = require('../models/Report');

/**
 * @desc    Get admin dashboard analytics
 * @route   GET /api/admin/analytics
 * @access  Admin
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalItems, activeItems, resolvedItems, claimedItems, totalClaims, pendingClaims, pendingReports] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Item.countDocuments(),
      Item.countDocuments({ status: 'active' }),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({ status: 'claimed' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Monthly listings for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Item.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top categories
    const topCategories = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', icon: '$category.icon', count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers, totalItems, activeItems, resolvedItems, claimedItems,
        totalClaims, pendingClaims, pendingReports,
        lostItems: await Item.countDocuments({ type: 'lost' }),
        foundItems: await Item.countDocuments({ type: 'found' }),
        bannedUsers: await User.countDocuments({ isBanned: true }),
        monthlyData,
        topCategories,
      },
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.isBanned) filter.isBanned = req.query.isBanned === 'true';

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort('-createdAt').skip(skip).limit(limit);

    res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), users });
  } catch (error) { next(error); }
};

/**
 * @desc    Ban or unban a user
 * @route   PUT /api/admin/users/:id/ban
 * @access  Admin
 */
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban an admin.' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully.`,
      user,
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Get all items (admin view)
 * @route   GET /api/admin/items
 * @access  Admin
 */
const getAllItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.isFlagged) filter.isFlagged = true;

    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('category', 'name icon')
      .populate('userId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), items });
  } catch (error) { next(error); }
};

/**
 * @desc    Get all claims (admin view)
 * @route   GET /api/admin/claims
 * @access  Admin
 */
const getAllClaims = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.status ? { status: req.query.status } : {};

    const total = await Claim.countDocuments(filter);
    const claims = await Claim.find(filter)
      .populate('itemId', 'title imageUrl type')
      .populate('claimantId', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), claims });
  } catch (error) { next(error); }
};

module.exports = { getAnalytics, getUsers, toggleBanUser, getAllItems, getAllClaims };
