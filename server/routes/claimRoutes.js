const express = require('express');
const router = express.Router();
const { submitClaim, getReceivedClaims, getMyClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submitClaim);
router.get('/received', protect, getReceivedClaims);
router.get('/my', protect, getMyClaims);
router.put('/:id', protect, updateClaimStatus);

module.exports = router;
