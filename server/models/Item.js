const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Type (lost/found) is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    location: {
      address: { type: String, required: [true, 'Location address is required'] },
      lat: { type: Number },
      lng: { type: Number },
    },
    dateLostOrFound: {
      type: Date,
      required: [true, 'Date lost or found is required'],
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'resolved'],
      default: 'active',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactMethod: {
      type: String,
      enum: ['phone', 'email', 'chat'],
      default: 'chat',
    },
    phone: {
      type: String,
      default: '',
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search
itemSchema.index({ title: 'text', description: 'text', 'location.address': 'text' });
itemSchema.index({ type: 1, status: 1, category: 1 });

module.exports = mongoose.model('Item', itemSchema);
