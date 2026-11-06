import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  Layers,
  Activity,
  Plus,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, CardSkeleton } from '../components/common/LoadingSpinner';

export const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/analytics'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
          setRecentProjects(statsRes.data.recentProjects || []);
          setRecentTasks(statsRes.data.recentTasks || []);
          setUpcomingDeadlines(statsRes.data.upcomingDeadlines || []);
          setRecentActivity(statsRes.data.recentActivity || []);
        }

        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading enterprise dashboard..." />;
  }

  // Format Recharts data
  const statusColors = {
    todo: '#94a3b8',
    'in-progress': '#3b82f6',
    review: '#f59e0b',
    completed: '#10b981',
  };

  const tasksByStatusData = (analytics?.tasksByStatus || []).map((item) => ({
    name: item._id === 'todo' ? 'To Do' : item._id === 'in-progress' ? 'In Progress' : item._id === 'review' ? 'Review' : 'Completed',
    value: item.count,
    color: statusColors[item._id] || '#64748b',
  }));

  const projectProgressData = (analytics?.projectProgress || []).map((p) => ({
    name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name,
    progress: p.progress,
    total: p.total,
    completed: p.completed,
  }));

  const userDistributionData = (analytics?.userTaskDistribution || []).map((u) => ({
    name: u.name,
    tasks: u.count,
  }));

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/projects',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: CheckSquare,
      color: 'from-indigo-600 to-purple-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/tasks',
    },
    {
      label: 'Pending Tasks',
      value: stats?.pendingTasks || 0,
      icon: Clock,
      color: 'from-slate-600 to-slate-800',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-100',
      link: '/tasks?status=todo',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks || 0,
      icon: TrendingUp,
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-600',
      bgColor: 'bg-sky-50',
      link: '/tasks?status=in-progress',
    },
    {
      label: 'Completed Tasks',
      value: stats?.completedTasks || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/tasks?status=completed',
    },
    {
      label: 'Overdue Tasks',
      value: stats?.overdueTasks || 0,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      link: '/tasks?overdue=true',
    },
    ...(isAdmin
      ? [
          {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'from-amber-500 to-orange-600',
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            link: '/users',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-medium mb-3 backdrop-blur-sm">
              <Activity className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'System Administrator Console' : 'Personal Workspace'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Track project milestones, view task progress, and collaborate seamlessly across your organization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tasks/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Link>
            <Link
              to="/kanban"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm"
            >
              <span>Kanban Board</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                to={card.link}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                    View
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {card.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                    {card.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks by Status Donut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Tasks by Status</h3>
            <span className="text-xs text-slate-400">Total: {stats?.totalTasks || 0}</span>
          </div>
          <div className="h-64 w-full">
            {tasksByStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tasksByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No task status data available
              </div>
            )}
          </div>
        </div>

        {/* Project Milestone Progress */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Project Completion Rate (%)</h3>
            <Link to="/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              All Projects
            </Link>
          </div>
          <div className="h-64 w-full">
            {projectProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Completed']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No project progress data available
              </div>
            )}
          </div>
        </div>

        {/* User Distribution (if admin) or Priority breakdown */}
        {isAdmin && userDistributionData.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Team Task Allocation</h3>
              <span className="text-xs text-slate-400">Assigned workload per member</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Lists Sections: Recent Projects & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects (2 cols) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Projects</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active initiatives and their current status</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      to={`/projects/${project._id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 transition-colors text-sm"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <PriorityBadge priority={project.priority} />
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No projects yet</div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Upcoming Deadlines</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tasks due in the next 7 days</p>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {task.title}
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="truncate max-w-[120px]">{task.project?.name || 'Project'}</span>
                    <span className="font-medium text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No urgent deadlines approaching</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Live Activity Audit Feed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time actions executed across your workspace</p>
          </div>
          <Link
            to="/activity"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View audit logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 6).map((log) => (
              <div key={log._id} className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {log.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-slate-900">{log.user?.name || 'System User'}</span>{' '}
                  <span className="text-slate-600">{log.description}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">No recent activity logs recorded</div>
          )}
        </div>
      </div>
    </div>
  );
};
