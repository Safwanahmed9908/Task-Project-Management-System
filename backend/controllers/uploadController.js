const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { logActivity } = require('../services/activityService');
const path = require('path');
const fs = require('fs');

// @desc    Upload file attachment to task
// @route   POST /api/upload/task/:taskId
// @access  Private
exports.uploadTaskFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  const attachment = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/tasks/${req.file.filename}`,
    uploadedBy: req.user._id,
    uploadedAt: new Date(),
  };

  task.attachments.push(attachment);
  await task.save();

  await logActivity(
    req.user._id,
    'uploaded_file',
    'file',
    task._id,
    req.file.originalname,
    `Uploaded file ${req.file.originalname} to task: ${task.title}`
  );

  res.status(200).json({ success: true, attachment, task });
});

// @desc    Upload project image
// @route   POST /api/upload/project/:projectId
// @access  Private/Admin
exports.uploadProjectImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const Project = require('../models/Project');
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Delete old image if exists
  if (project.image && project.image.startsWith('/uploads/')) {
    const oldImagePath = path.join(__dirname, '..', project.image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  const imageUrl = `/uploads/projects/${req.file.filename}`;
  project.image = imageUrl;
  await project.save();

  res.status(200).json({ success: true, imageUrl, project });
});
