const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { logActivity } = require('../services/activityService');
const path = require('path');
const fs = require('fs');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Regular users only see projects they're members of or managers of
  if (req.user.role !== 'admin') {
    query.$or = [
      { manager: req.user._id },
      { members: req.user._id },
      { createdBy: req.user._id },
    ];
  }

  // Search
  if (req.query.search) {
    const searchQuery = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  // Filter by status
  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  // Filter by priority
  if (req.query.priority && req.query.priority !== 'all') {
    query.priority = req.query.priority;
  }

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort = { createdAt: -1 };
  }

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate('manager', 'name email profileImage')
    .populate('members', 'name email profileImage')
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Add task counts for each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const taskStats = await Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const totalTasks = await Task.countDocuments({ project: project._id });
      const completedTasks = await Task.countDocuments({ project: project._id, status: 'completed' });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        progress,
        taskStats,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    projects: projectsWithStats,
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('manager', 'name email profileImage designation department')
    .populate('members', 'name email profileImage designation department')
    .populate('createdBy', 'name email');

  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }

  // Check access for non-admins
  if (req.user.role !== 'admin') {
    const hasAccess =
      project.manager._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m._id.toString() === req.user._id.toString()) ||
      project.createdBy._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return next(new ErrorResponse('Not authorized to access this project', 403));
    }
  }

  const tasks = await Task.find({ project: project._id })
    .populate('assignedTo', 'name email profileImage')
    .sort({ createdAt: -1 });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.status(200).json({
    success: true,
    project: { ...project.toObject(), tasks, totalTasks, completedTasks, progress },
  });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user._id;

  if (!req.body.manager) {
    req.body.manager = req.user._id;
  }

  const project = await Project.create(req.body);
  const populatedProject = await Project.findById(project._id)
    .populate('manager', 'name email profileImage')
    .populate('members', 'name email profileImage');

  await logActivity(req.user._id, 'created_project', 'project', project._id, project.name, `Created project: ${project.name}`);

  res.status(201).json({ success: true, project: populatedProject });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }

  // Only admin or project manager can update
  if (req.user.role !== 'admin' && project.manager.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this project', 403));
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('manager', 'name email profileImage')
    .populate('members', 'name email profileImage');

  await logActivity(req.user._id, 'updated_project', 'project', project._id, project.name, `Updated project: ${project.name}`);

  res.status(200).json({ success: true, project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admins can delete projects', 403));
  }

  const projectName = project.name;
  // Delete associated tasks
  await Task.deleteMany({ project: project._id });
  await Project.deleteOne({ _id: req.params.id });

  await logActivity(req.user._id, 'deleted_project', 'project', req.params.id, projectName, `Deleted project: ${projectName}`);

  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});
