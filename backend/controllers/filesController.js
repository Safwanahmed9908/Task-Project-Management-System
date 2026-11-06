const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const fs = require('fs');

// @desc    Delete file attachment from task
// @route   DELETE /api/files/task/:taskId/:attachmentId
// @access  Private
exports.deleteTaskFile = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  const attachment = task.attachments.id(req.params.attachmentId);
  if (!attachment) {
    return next(new ErrorResponse('Attachment not found', 404));
  }

  // Check permissions
  if (
    req.user.role !== 'admin' &&
    attachment.uploadedBy.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorResponse('Not authorized to delete this file', 403));
  }

  // Delete physical file
  if (attachment.path) {
    const filePath = path.join(__dirname, '..', attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Remove attachment from task
  task.attachments.pull(req.params.attachmentId);
  await task.save();

  res.status(200).json({ success: true, message: 'File deleted successfully' });
});

// @desc    Get all files for a task
// @route   GET /api/files/task/:taskId
// @access  Private
exports.getTaskFiles = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId)
    .populate('attachments.uploadedBy', 'name email');

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  res.status(200).json({ success: true, attachments: task.attachments });
});
