const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: ['spam', 'fake', 'inappropriate', 'duplicate', 'scam', 'other'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate reports from same user for same item
reportSchema.index({ itemId: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
