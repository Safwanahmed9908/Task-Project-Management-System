const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { logActivity } = require('../services/activityService');
const path = require('path');
const fs = require('fs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Search
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { department: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Filter by role
  if (req.query.role && req.query.role !== 'all') {
    query.role = req.query.role;
  }

  // Filter by active status
  if (req.query.isActive !== undefined && req.query.isActive !== 'all') {
    query.isActive = req.query.isActive === 'true';
  }

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort = { createdAt: -1 };
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort(sort).skip(skip).limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, user });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, department, designation } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  const user = await User.create({ name, email, password, role, phone, department, designation });

  await logActivity(req.user._id, 'created_user', 'user', user._id, user.name, `Created user ${user.name}`);

  res.status(201).json({ success: true, user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, phone, department, designation, isActive } = req.body;

  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check email uniqueness if changing
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, phone, department, designation, isActive },
    { new: true, runValidators: true }
  );

  await logActivity(req.user._id, 'updated_user', 'user', user._id, user.name, `Updated user ${user.name}`);

  res.status(200).json({ success: true, user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  const userName = user.name;
  await User.deleteOne({ _id: req.params.id });

  await logActivity(req.user._id, 'deleted_user', 'user', req.params.id, userName, `Deleted user ${userName}`);

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
