import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
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
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AnalyticsPage = () => {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [anRes, stRes] = await Promise.all([
          api.get('/dashboard/analytics'),
          api.get('/dashboard/stats'),
        ]);

        if (anRes.data.success) setAnalytics(anRes.data);
        if (stRes.data.success) setStats(stRes.data.stats);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling organizational analytics..." />;
  }

  // Formatting chart data
  const statusColors = {
    todo: '#94a3b8',
    'in-progress': '#3b82f6',
    review: '#f59e0b',
    completed: '#10b981',
  };

  const tasksByStatusData = (analytics?.tasksByStatus || []).map((item) => ({
    name: item._id === 'todo' ? 'To Do' : item._id === 'in-progress' ? 'In Progress' : item._id === 'review' ? 'In Review' : 'Completed',
    count: item.count,
    color: statusColors[item._id] || '#64748b',
  }));

  const priorityColors = {
    low: '#10b981',
    medium: '#0284c7',
    high: '#f59e0b',
    critical: '#ef4444',
  };

  const tasksByPriorityData = (analytics?.tasksByPriority || []).map((item) => ({
    name: item._id.toUpperCase(),
    count: item.count,
    fill: priorityColors[item._id] || '#64748b',
  }));

  const projectProgressData = (analytics?.projectProgress || []).map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    progress: p.progress,
    total: p.total,
    completed: p.completed,
  }));

  const userDistributionData = (analytics?.userTaskDistribution || []).map((u) => ({
    name: u.name,
    tasks: u.count,
  }));

  const monthlyCompletionData = (analytics?.monthlyCompletion || []).map((m) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: `${months[m._id.month - 1]} ${m._id.year}`,
      completed: m.count,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Reports & Analytics</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Comprehensive project completion metrics, velocity analysis, and team task allocation
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Completion</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {stats?.totalTasks > 0
              ? `${Math.round(((stats?.completedTasks || 0) / stats?.totalTasks) * 100)}%`
              : '0%'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks done
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">
            {stats?.totalProjects || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Initiatives in lifecycle</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress Tasks</div>
          <div className="text-3xl font-extrabold text-sky-600 mt-2">
            {stats?.inProgressTasks || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Currently being worked on</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Tasks</div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">
            {stats?.overdueTasks || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Requiring immediate attention</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks by Status Pie */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">Tasks Distribution by Status</h3>
          <p className="text-xs text-slate-500 mb-6">Proportion of backlog across stages</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tasksByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">Tasks by Priority Level</h3>
          <p className="text-xs text-slate-500 mb-6">Distribution across urgency tiers</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByPriorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {tasksByPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress Horizontal / Vertical Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">Project Milestone Progress (%)</h3>
          <p className="text-xs text-slate-500 mb-6">Percentage of completed deliverables</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Progress']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="progress" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Task Distribution (Admin) or Monthly Velocity Area */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {isAdmin ? 'Team Workload Distribution' : 'Monthly Velocity'}
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            {isAdmin ? 'Active task assignments per team member' : 'Historical completion trajectory'}
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {isAdmin && userDistributionData.length > 0 ? (
                <BarChart data={userDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="tasks" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyCompletionData.length > 0 ? monthlyCompletionData : [{ month: 'Current', completed: stats?.completedTasks || 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#ecfdf5" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
