import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit,
  Paperclip,
  Upload,
  Download,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${id}`);
      if (res.data.success) {
        setTask(res.data.task);
      }
    } catch (err) {
      error(err.response?.data?.error || 'Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/tasks/${id}`, { status: newStatus });
      if (res.data.success) {
        success('Task status updated successfully');
        setTask(res.data.task);
      }
    } catch (err) {
      error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File size cannot exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      const res = await api.post(`/upload/task/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        success('Attachment uploaded successfully!');
        fetchTask();
      }
    } catch (err) {
      error(err.response?.data?.error || 'Failed to upload attachment');
    } finally {
      setUploadingFile(false);
      e.target.value = null; // reset input
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/tasks/${id}`);
      success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      error(err.response?.data?.error || 'Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task details..." />;
  }

  if (!task) return null;

  const isOverdue =
    task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const canEdit = isAdmin || task.createdBy?._id === user?._id || task.assignedTo?._id === user?._id;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/tasks"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-slate-200"
            title="Back to Tasks"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Overdue
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{task.title}</h1>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/tasks/${id}/edit`}
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

      {/* Main Grid: Description & Attributes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 lg:col-span-2">
          {/* Status Quick Changer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Quick Status Transition:</span>
            <div className="flex items-center gap-1.5">
              {['todo', 'in-progress', 'review', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                    task.status === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Task Scope & Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {task.description || 'No detailed description provided for this task.'}
            </p>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag, i) => (
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

          {/* Attachments Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" />
                <span>Attachments ({(task.attachments || []).length})</span>
              </h3>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingFile ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              {(task.attachments || []).length > 0 ? (
                task.attachments.map((att) => (
                  <div
                    key={att._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {att.originalname || att.filename}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Attachment'} • Uploaded by{' '}
                          {att.uploadedBy?.name || 'Member'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={`/api/files/tasks/${att.filename}`}
                      download={att.originalname || att.filename}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No files or documents attached yet. Click "Upload File" to add one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 col: Project, Assignee, Dates */}
        <div className="space-y-6">
          {/* Project Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Project Context
            </h3>
            <Link
              to={`/projects/${task.project?._id}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors group"
            >
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {task.project?.name}
                </div>
                <div className="text-[11px] text-slate-400 capitalize">
                  {task.project?.status}
                </div>
              </div>
            </Link>
          </div>

          {/* Assigned Member */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Member
            </h3>
            {task.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                  {task.assignedTo.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{task.assignedTo.name}</div>
                  <div className="text-xs text-slate-500">{task.assignedTo.department || task.assignedTo.email}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No user assigned</div>
            )}
          </div>

          {/* Schedule Dates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Schedule Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-semibold text-slate-800">
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Immediate'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Open-ended'}
                </span>
              </div>
              {task.completedAt && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Completed At:</span>
                  <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-600">
                  {new Date(task.createdAt).toLocaleDateString()} by {task.createdBy?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"?`}
        confirmText="Delete Task"
        isDanger={true}
        isLoading={deleteLoading}
      />
    </div>
  );
};
