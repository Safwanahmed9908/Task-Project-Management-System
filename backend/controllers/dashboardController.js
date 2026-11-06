const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  let projectQuery = {};
  let taskQuery = {};

  if (req.user.role !== 'admin') {
    projectQuery.$or = [
      { manager: req.user._id },
      { members: req.user._id },
      { createdBy: req.user._id },
    ];
    taskQuery.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
  }

  const now = new Date();

  const [
    totalProjects,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    reviewTasks,
    totalUsers,
    recentProjects,
    recentTasks,
    upcomingDeadlines,
    recentActivity,
    projectsByStatus,
  ] = await Promise.all([
    Project.countDocuments(projectQuery),
    Task.countDocuments(taskQuery),
    Task.countDocuments({ ...taskQuery, status: 'todo' }),
    Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
    Task.countDocuments({ ...taskQuery, status: 'completed' }),
    Task.countDocuments({ ...taskQuery, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
    Task.countDocuments({ ...taskQuery, status: 'review' }),
    req.user.role === 'admin' ? User.countDocuments() : Promise.resolve(null),
    Project.find(projectQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('manager', 'name email profileImage')
      .populate('members', 'name email profileImage'),
    Task.find(taskQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('project', 'name')
      .populate('assignedTo', 'name email profileImage'),
    Task.find({ ...taskQuery, dueDate: { $gte: now }, status: { $ne: 'completed' } })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('project', 'name')
      .populate('assignedTo', 'name email profileImage'),
    ActivityLog.find(req.user.role === 'admin' ? {} : { user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email profileImage'),
    Project.aggregate([
      { $match: projectQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Add task stats to recent projects
  const recentProjectsWithStats = await Promise.all(
    recentProjects.map(async (project) => {
      const totalProjTasks = await Task.countDocuments({ project: project._id });
      const completedProjTasks = await Task.countDocuments({ project: project._id, status: 'completed' });
      const progress = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;
      return { ...project.toObject(), totalTasks: totalProjTasks, completedTasks: completedProjTasks, progress };
    })
  );

  res.status(200).json({
    success: true,
    stats: {
      totalProjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      reviewTasks,
      totalUsers,
    },
    recentProjects: recentProjectsWithStats,
    recentTasks,
    upcomingDeadlines,
    recentActivity,
    projectsByStatus,
  });
});

// @desc    Get task analytics
// @route   GET /api/dashboard/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  let taskQuery = {};
  let projectQuery = {};

  if (req.user.role !== 'admin') {
    taskQuery.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    projectQuery.$or = [{ manager: req.user._id }, { members: req.user._id }, { createdBy: req.user._id }];
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Tasks by status distribution
  const tasksByStatus = await Task.aggregate([
    { $match: taskQuery },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Tasks by priority
  const tasksByPriority = await Task.aggregate([
    { $match: taskQuery },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // Tasks completed over last 30 days (daily)
  const tasksCompletedOverTime = await Task.aggregate([
    {
      $match: {
        ...taskQuery,
        completedAt: { $gte: thirtyDaysAgo },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
          day: { $dayOfMonth: '$completedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Tasks created over last 30 days (daily)
  const tasksCreatedOverTime = await Task.aggregate([
    {
      $match: {
        ...taskQuery,
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Projects by status
  const projectsByStatus = await Project.aggregate([
    { $match: projectQuery },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Projects by priority
  const projectsByPriority = await Project.aggregate([
    { $match: projectQuery },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // Overdue tasks count
  const overdueCount = await Task.countDocuments({
    ...taskQuery,
    dueDate: { $lt: now },
    status: { $ne: 'completed' },
  });

  // Tasks due this week
  const tasksDueThisWeek = await Task.countDocuments({
    ...taskQuery,
    dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    status: { $ne: 'completed' },
  });

  // Project progress
  const projects = await Project.find(projectQuery).select('name status');
  const projectProgress = await Promise.all(
    projects.map(async (p) => {
      const total = await Task.countDocuments({ project: p._id });
      const completed = await Task.countDocuments({ project: p._id, status: 'completed' });
      return {
        name: p.name,
        total,
        completed,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        status: p.status,
      };
    })
  );

  // User task distribution (admin only)
  let userTaskDistribution = [];
  if (req.user.role === 'admin') {
    userTaskDistribution = await Task.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', count: 1 } },
    ]);
  }

  res.status(200).json({
    success: true,
    tasksByStatus,
    tasksByPriority,
    projectProgress,
    userTaskDistribution,
    projectsByStatus,
    projectsByPriority,
    analytics: {
      tasksByStatus,
      tasksByPriority,
      tasksCompletedOverTime,
      tasksCreatedOverTime,
      projectsByStatus,
      projectsByPriority,
      projectProgress,
      userTaskDistribution,
      overdueCount,
      tasksDueThisWeek,
    },
  });
});
