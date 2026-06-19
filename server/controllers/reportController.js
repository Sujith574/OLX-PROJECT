const Report = require('../models/Report');
const Item = require('../models/Item');

const submitReport = async (req, res, next) => {
  try {
    const { itemId, reason, description } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const report = await Report.create({ itemId, reportedBy: req.user._id, reason, description });
    res.status(201).json({ success: true, message: 'Report submitted. We will review it shortly.', report });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reported this item.' });
    }
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('itemId', 'title imageUrl type status')
      .populate('reportedBy', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) { next(error); }
};

const updateReport = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, adminNote }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    // If reviewed, flag the item
    if (status === 'reviewed') {
      await Item.findByIdAndUpdate(report.itemId, { isFlagged: true, flagReason: adminNote });
    }

    res.status(200).json({ success: true, message: 'Report updated!', report });
  } catch (error) { next(error); }
};

module.exports = { submitReport, getReports, updateReport };
