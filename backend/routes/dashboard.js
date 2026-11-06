const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStats, getAnalytics } = require('../controllers/dashboardController');

router.use(protect);

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

module.exports = router;
