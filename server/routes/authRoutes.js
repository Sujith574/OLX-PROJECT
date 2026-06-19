const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, uploadAvatar.single('avatar'), register);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
