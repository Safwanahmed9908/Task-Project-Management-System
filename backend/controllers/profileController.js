const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { logActivity } = require('../services/activityService');
const path = require('path');
const fs = require('fs');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, department, designation } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, department, designation },
    { new: true, runValidators: true }
  );

  await logActivity(req.user._id, 'updated_profile', 'user', req.user._id, user.name, `${user.name} updated their profile`);

  res.status(200).json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(new ErrorResponse('New password must be at least 6 characters', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  await logActivity(req.user._id, 'changed_password', 'user', req.user._id, user.name, `${user.name} changed their password`);

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// @desc    Upload profile image
// @route   PUT /api/profile/image
// @access  Private
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old profile image if it exists and is not a URL
  if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
    const oldImagePath = path.join(__dirname, '..', user.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  const imageUrl = `/uploads/profiles/${req.file.filename}`;
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage: imageUrl },
    { new: true }
  );

  res.status(200).json({ success: true, user: updatedUser, imageUrl });
});
