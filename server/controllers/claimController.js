const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { generateClaimQR } = require('../services/qrService');
const { sendClaimSubmittedEmail, sendClaimApprovedEmail, sendClaimRejectedEmail } = require('../services/emailService');
const User = require('../models/User');

/**
 * @desc    Submit a claim on an item
 * @route   POST /api/claims
 * @access  Protected
 */
const submitClaim = async (req, res, next) => {
  try {
    const { itemId, message, proofDescription } = req.body;

    const item = await Item.findById(itemId).populate('userId', 'name email notificationsEnabled');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This item is no longer available for claims.' });
    }

    // Cannot claim own item
    if (item.userId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item.' });
    }

    // Check existing claim
    const existingClaim = await Claim.findOne({ itemId, claimantId: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already submitted a claim for this item.' });
    }

    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      message,
      proofDescription,
    });

    // Create notification for item owner
    await Notification.create({
      userId: item.userId._id,
      type: 'claim_submitted',
      title: 'New Claim on Your Item',
      message: `${req.user.name} has submitted a claim on "${item.title}"`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      link: `/dashboard?tab=claims`,
    });

    // Send email to item owner
    if (item.userId.notificationsEnabled) {
      await sendClaimSubmittedEmail({
        ownerEmail: item.userId.email,
        ownerName: item.userId.name,
        itemTitle: item.title,
        claimantName: req.user.name,
      });
    }

    // Emit socket notification
    if (req.io) {
      req.io.to(item.userId._id.toString()).emit('notification', {
        type: 'claim_submitted',
        title: 'New Claim',
        message: `${req.user.name} claimed "${item.title}"`,
      });
    }

    await claim.populate('claimantId', 'name avatar email');
    await claim.populate('itemId', 'title imageUrl');

    res.status(201).json({ success: true, message: 'Claim submitted successfully!', claim });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a claim for this item.' });
    }
    next(error);
  }
};

/**
 * @desc    Get claims for my items (as owner)
 * @route   GET /api/claims/received
 * @access  Protected
 */
const getReceivedClaims = async (req, res, next) => {
  try {
    const myItems = await Item.find({ userId: req.user._id }).select('_id');
    const itemIds = myItems.map((i) => i._id);

    const claims = await Claim.find({ itemId: { $in: itemIds } })
      .populate('claimantId', 'name avatar email phone')
      .populate('itemId', 'title imageUrl type')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: claims.length, claims });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my submitted claims
 * @route   GET /api/claims/my
 * @access  Protected
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId', 'title imageUrl type status location userId')
      .populate({ path: 'itemId', populate: { path: 'userId', select: 'name avatar' } })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: claims.length, claims });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update claim status (approve/reject)
 * @route   PUT /api/claims/:id
 * @access  Protected (item owner only)
 */
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId', 'name email notificationsEnabled');

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

    // Check item ownership
    if (claim.itemId.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Generate QR code if approving
    let qrCode = claim.qrCode;
    if (status === 'approved' && !qrCode) {
      qrCode = await generateClaimQR({
        claimId: claim._id.toString(),
        itemId: claim.itemId._id.toString(),
        claimantId: claim.claimantId._id.toString(),
      });
    }

    claim.status = status;
    claim.adminNote = adminNote || '';
    claim.qrCode = qrCode || '';
    await claim.save();

    // Update item status if approved
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.itemId._id, { status: 'claimed' });
    }

    // Create notification for claimant
    await Notification.create({
      userId: claim.claimantId._id,
      type: status === 'approved' ? 'claim_approved' : 'claim_rejected',
      title: status === 'approved' ? 'Claim Approved! 🎉' : 'Claim Rejected',
      message: status === 'approved'
        ? `Your claim for "${claim.itemId.title}" was approved!`
        : `Your claim for "${claim.itemId.title}" was not approved.`,
      relatedItem: claim.itemId._id,
      relatedClaim: claim._id,
      link: '/dashboard?tab=claims',
    });

    // Send email
    if (claim.claimantId.notificationsEnabled) {
      if (status === 'approved') {
        const owner = await User.findById(req.user._id);
        await sendClaimApprovedEmail({
          claimantEmail: claim.claimantId.email,
          claimantName: claim.claimantId.name,
          itemTitle: claim.itemId.title,
          ownerName: owner.name,
        });
      } else {
        await sendClaimRejectedEmail({
          claimantEmail: claim.claimantId.email,
          claimantName: claim.claimantId.name,
          itemTitle: claim.itemId.title,
          reason: adminNote,
        });
      }
    }

    // Emit socket notification
    if (req.io) {
      req.io.to(claim.claimantId._id.toString()).emit('notification', {
        type: `claim_${status}`,
        title: status === 'approved' ? 'Claim Approved!' : 'Claim Rejected',
        message: `Your claim on "${claim.itemId.title}" has been ${status}.`,
      });
    }

    res.status(200).json({ success: true, message: `Claim ${status} successfully!`, claim });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitClaim, getReceivedClaims, getMyClaims, updateClaimStatus };
