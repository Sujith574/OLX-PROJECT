const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, toggleBanUser, getAllItems, getAllClaims } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);
router.get('/items', getAllItems);
router.get('/claims', getAllClaims);

module.exports = router;
