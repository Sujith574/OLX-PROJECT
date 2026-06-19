const express = require('express');
const router = express.Router();
const { submitReport, getReports, updateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.post('/', protect, submitReport);
router.get('/', protect, adminOnly, getReports);
router.put('/:id', protect, adminOnly, updateReport);

module.exports = router;
