const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Claim message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    proofDescription: {
      type: String,
      required: [true, 'Proof description is required'],
      minlength: [10, 'Proof description must be at least 10 characters'],
      maxlength: [1000, 'Proof description cannot exceed 1000 characters'],
    },
    proofImageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    qrCode: {
      type: String,
      default: '',
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate claims
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
