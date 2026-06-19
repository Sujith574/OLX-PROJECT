const Item = require('../models/Item');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Create new item listing
 * @route   POST /api/items
 * @access  Protected
 */
const createItem = async (req, res, next) => {
  try {
    const { title, description, category, type, location, dateLostOrFound, contactMethod, phone, lat, lng } = req.body;

    let imageUrl = '';
    let imagePublicId = '';
    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const item = await Item.create({
      title,
      description,
      category,
      type,
      imageUrl,
      imagePublicId,
      location: { address: location, lat: lat ? parseFloat(lat) : undefined, lng: lng ? parseFloat(lng) : undefined },
      dateLostOrFound,
      contactMethod,
      phone,
      userId: req.user._id,
    });

    await item.populate('category', 'name icon');
    await item.populate('userId', 'name avatar email');

    res.status(201).json({ success: true, message: 'Item listed successfully!', item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items with filtering, sorting, pagination
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Remove empty/all values
    Object.keys(queryObj).forEach((key) => {
      if (!queryObj[key] || queryObj[key] === 'all') delete queryObj[key];
    });

    let query = Item.find(queryObj);

    // Text search
    if (req.query.search) {
      query = Item.find({ $text: { $search: req.query.search }, ...queryObj });
    }

    // Filter by location (partial match)
    if (req.query.location) {
      query = query.where('location.address').regex(new RegExp(req.query.location, 'i'));
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query = query.where('dateLostOrFound').gte(req.query.startDate).lte(req.query.endDate);
    }

    // Sort
    const sort = req.query.sort || '-createdAt';
    query = query.sort(sort);

    // Populate
    query = query
      .populate('category', 'name icon')
      .populate('userId', 'name avatar');

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const total = await Item.countDocuments(queryObj);

    query = query.skip(skip).limit(limit);
    const items = await query;

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('userId', 'name avatar email phone');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Increment view count
    item.views += 1;
    await item.save({ validateBeforeSave: false });

    // Get related items
    const related = await Item.find({
      category: item.category._id,
      _id: { $ne: item._id },
      status: 'active',
      type: item.type,
    })
      .limit(4)
      .populate('category', 'name icon')
      .select('title imageUrl location dateLostOrFound status type');

    res.status(200).json({ success: true, item, related });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Protected (owner only)
 */
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    // Check ownership
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item.' });
    }

    const { title, description, category, location, dateLostOrFound, contactMethod, phone, status, lat, lng } = req.body;

    // Handle image update
    if (req.file) {
      if (item.imagePublicId) {
        await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
      }
      req.body.imageUrl = req.file.path;
      req.body.imagePublicId = req.file.filename;
    }

    const updateData = {
      title, description, category, contactMethod, phone, status,
      ...(location && { location: { address: location, lat: lat ? parseFloat(lat) : item.location.lat, lng: lng ? parseFloat(lng) : item.location.lng } }),
      ...(dateLostOrFound && { dateLostOrFound }),
      ...(req.file && { imageUrl: req.file.path, imagePublicId: req.file.filename }),
    };

    item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('category', 'name icon')
      .populate('userId', 'name avatar');

    res.status(200).json({ success: true, message: 'Item updated successfully!', item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Protected (owner/admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item.' });
    }

    // Delete image from Cloudinary
    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get items by current user
 * @route   GET /api/items/my
 * @access  Protected
 */
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ userId: req.user._id })
      .populate('category', 'name icon')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured items for home page
 * @route   GET /api/items/featured
 * @access  Public
 */
const getFeaturedItems = async (req, res, next) => {
  try {
    const lostItems = await Item.find({ type: 'lost', status: 'active' })
      .sort('-createdAt').limit(6)
      .populate('category', 'name icon')
      .populate('userId', 'name avatar');

    const foundItems = await Item.find({ type: 'found', status: 'active' })
      .sort('-createdAt').limit(6)
      .populate('category', 'name icon')
      .populate('userId', 'name avatar');

    const stats = {
      totalItems: await Item.countDocuments(),
      lostItems: await Item.countDocuments({ type: 'lost' }),
      foundItems: await Item.countDocuments({ type: 'found' }),
      resolvedItems: await Item.countDocuments({ status: 'resolved' }),
    };

    res.status(200).json({ success: true, lostItems, foundItems, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem, getMyItems, getFeaturedItems };
