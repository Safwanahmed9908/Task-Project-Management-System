const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get activity logs
// @route   GET /api/activity
// @access  Private
exports.getActivity = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Regular users only see their own activity
  if (req.user.role !== 'admin') {
    query.user = req.user._id;
  }

  // Filter by user
  if (req.query.userId && req.user.role === 'admin') {
    query.user = req.query.userId;
  }

  // Filter by entity type
  if (req.query.entity && req.query.entity !== 'all') {
    query.entity = req.query.entity;
  }

  // Filter by action
  if (req.query.action && req.query.action !== 'all') {
    query.action = req.query.action;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const total = await ActivityLog.countDocuments(query);
  const activities = await ActivityLog.find(query)
    .populate('user', 'name email profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: activities.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    logs: activities,
    activities,
  });
});
