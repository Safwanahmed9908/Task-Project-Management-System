const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActivity } = require('../controllers/activityController');

router.use(protect);

router.get('/', getActivity);

module.exports = router;
