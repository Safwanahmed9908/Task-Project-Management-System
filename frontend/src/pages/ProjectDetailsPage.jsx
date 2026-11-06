import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckSquare,
  Plus,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  Tag,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      error(err.response?.data?.error || 'Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/projects/${id}`);
      success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      error(err.response?.data?.error || 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." />;
  }

  if (!project) return null;

  const canEdit = isAdmin || project.manager?._id === user?._id;
  const filteredTasks = (project.tasks || []).filter(
    (t) => taskFilter === 'all' || t.status === taskFilter
  );

  return (
    <div className="space-y-8">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-slate-200"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/projects/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-xs"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Edit</span>
            </Link>
            {isAdmin && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Details Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Overview & Description */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 lg:col-span-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Project Overview
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Progress Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-600">Overall Milestone Progress</span>
              <span className="text-blue-600 font-bold text-sm">{project.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{project.completedTasks || 0} completed tasks</span>
              <span>{project.totalTasks || 0} total tasks</span>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags & Domains
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Manager, Members, Dates */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Timeline & Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Delivery:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-600">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Project Manager Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Project Lead / Manager
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                {project.manager?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900">{project.manager?.name}</div>
                <div className="text-xs text-slate-500">{project.manager?.designation || project.manager?.email}</div>
              </div>
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Members ({(project.members || []).length})
              </h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(project.members || []).map((member) => (
                <div key={member._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden text-xs">
                    <div className="font-semibold text-slate-800 truncate">{member.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{member.department || member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Project Tasks Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Project Tasks</h2>
            <p className="text-xs text-slate-500">All deliverables and action items linked to this project</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>

            <Link
              to={`/tasks/create?projectId=${project._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </Link>
          </div>
        </div>

        {/* Tasks List */}
        <div className="divide-y divide-slate-100">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <Link
                      to={`/tasks/${task._id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 transition-colors text-sm line-clamp-1"
                    >
                      {task.title}
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                  {task.assignedTo && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {task.assignedTo.name?.charAt(0)}
                      </div>
                      <span>{task.assignedTo.name}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}

                  <Link
                    to={`/tasks/${task._id}`}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No tasks found for this status.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${project.name}" and all of its tasks?`}
        confirmText="Delete Project"
        isDanger={true}
        isLoading={deleteLoading}
      />
    </div>
  );
};
