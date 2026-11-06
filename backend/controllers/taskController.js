const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { logActivity } = require('../services/activityService');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Regular users only see their own tasks
  if (req.user.role !== 'admin') {
    query.$or = [
      { assignedTo: req.user._id },
      { createdBy: req.user._id },
    ];
  }

  // Search
  if (req.query.search) {
    const searchQuery = {
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ],
    };
    if (query.$or) {
      query = { $and: [{ $or: query.$or }, searchQuery] };
    } else {
      query = { ...query, ...searchQuery };
    }
  }

  // Filter by status
  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  // Filter by priority
  if (req.query.priority && req.query.priority !== 'all') {
    query.priority = req.query.priority;
  }

  // Filter by project
  if (req.query.project && req.query.project !== 'all') {
    query.project = req.query.project;
  }

  // Filter by assigned user
  if (req.query.assignedTo && req.query.assignedTo !== 'all') {
    query.assignedTo = req.query.assignedTo;
  }

  // Filter overdue
  if (req.query.overdue === 'true') {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: 'completed' };
  }

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort = { createdAt: -1 };
  }

  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .populate('project', 'name status')
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    tasks,
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'name status priority')
    .populate('assignedTo', 'name email profileImage designation department')
    .populate('createdBy', 'name email profileImage')
    .populate('attachments.uploadedBy', 'name');

  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  // Check access
  if (req.user.role !== 'admin') {
    const hasAccess =
      (task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString()) ||
      task.createdBy._id.toString() === req.user._id.toString();
    if (!hasAccess) {
      return next(new ErrorResponse('Not authorized to access this task', 403));
    }
  }

  res.status(200).json({ success: true, task });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user._id;

  // Validate project exists
  const project = await Project.findById(req.body.project);
  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  const task = await Task.create(req.body);
  const populatedTask = await Task.findById(task._id)
    .populate('project', 'name status')
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email');

  await logActivity(
    req.user._id,
    'created_task',
    'task',
    task._id,
    task.title,
    `Created task: ${task.title}`
  );

  res.status(201).json({ success: true, task: populatedTask });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isAssigned && !isCreator) {
      return next(new ErrorResponse('Not authorized to update this task', 403));
    }
    // Regular users can only update status
    const allowedFields = ['status'];
    const updateFields = Object.keys(req.body);
    const hasDisallowedFields = updateFields.some((f) => !allowedFields.includes(f));
    if (hasDisallowedFields && !isCreator) {
      return next(new ErrorResponse('You can only update task status', 403));
    }
  }

  const oldStatus = task.status;

  if (req.body.status === 'completed' && !req.body.completedAt) {
    req.body.completedAt = new Date();
  } else if (req.body.status && req.body.status !== 'completed') {
    req.body.completedAt = null;
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('project', 'name status')
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email');

  const action = req.body.status && req.body.status !== oldStatus ? 'updated_task_status' : 'updated_task';
  await logActivity(
    req.user._id,
    action,
    'task',
    task._id,
    task.title,
    action === 'updated_task_status'
      ? `Changed task status from ${oldStatus} to ${req.body.status}: ${task.title}`
      : `Updated task: ${task.title}`
  );

  res.status(200).json({ success: true, task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admins can delete tasks', 403));
  }

  const taskTitle = task.title;
  await Task.deleteOne({ _id: req.params.id });

  await logActivity(req.user._id, 'deleted_task', 'task', req.params.id, taskTitle, `Deleted task: ${taskTitle}`);

  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});
