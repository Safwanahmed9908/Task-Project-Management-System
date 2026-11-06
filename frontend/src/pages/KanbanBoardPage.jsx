import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Columns3,
  Plus,
  Search,
  Filter,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FolderKanban,
  MoreVertical,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  { id: 'review', title: 'Review', color: 'bg-amber-50 text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
];

export const KanbanBoardPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks?limit=200'),
        api.get('/projects?limit=100'),
      ]);

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks);
      }
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects);
      }
    } catch (err) {
      error('Failed to load Kanban board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const handleMoveStatus = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        success(`Task moved to ${newStatus.replace('-', ' ')}`);
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      error(err.response?.data?.error || 'Failed to move task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesProject = selectedProject === 'all' || t.project?._id === selectedProject;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchesProject && matchesSearch;
  });

  const getColumnTasks = (statusId) =>
    filteredTasks.filter((t) => t.status === statusId);

  if (loading) {
    return <LoadingSpinner text="Rendering interactive Kanban board..." />;
  }

  return (
    <div className="space-y-6">
      {/* Board Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Columns3 className="w-6 h-6 text-blue-600" />
            <span>Kanban Board</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time visual task pipeline across workflow stages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Project:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter board..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-44"
            />
          </div>

          <Link
            to="/tasks/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      {/* 4 Columns Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col, colIndex) => {
          const colTasks = getColumnTasks(col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/80 flex flex-col max-h-[calc(100vh-220px)] min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">{col.title}</h3>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-600 text-[11px] font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <Link
                  to={`/tasks/create?status=${col.id}`}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                  title={`Add ${col.title} Task`}
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => {
                    const isOverdue =
                      task.dueDate &&
                      task.status !== 'completed' &&
                      new Date(task.dueDate) < new Date();

                    return (
                      <div
                        key={task._id}
                        className={`bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group relative ${
                          updatingTaskId === task._id ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {/* Project Name & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
                            {task.project?.name || 'Project'}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {/* Title */}
                        <Link
                          to={`/tasks/${task._id}`}
                          className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-xs line-clamp-2 mb-3 block"
                        >
                          {task.title}
                        </Link>

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 truncate">
                            {task.assignedTo ? (
                              <>
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {task.assignedTo.name?.charAt(0)}
                                </div>
                                <span className="truncate max-w-[80px] text-slate-700 font-medium">
                                  {task.assignedTo.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </div>

                          {task.dueDate && (
                            <span
                              className={`flex items-center gap-1 shrink-0 ${
                                isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Step Move Controls Bar (Quick Move Arrows) */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          {colIndex > 0 ? (
                            <button
                              onClick={() => handleMoveStatus(task._id, COLUMNS[colIndex - 1].id)}
                              className="inline-flex items-center gap-0.5 text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-50"
                              title={`Move to ${COLUMNS[colIndex - 1].title}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{COLUMNS[colIndex - 1].title}</span>
                            </button>
                          ) : (
                            <span />
                          )}

                          {colIndex < COLUMNS.length - 1 ? (
                            <button
                              onClick={() => handleMoveStatus(task._id, COLUMNS[colIndex + 1].id)}
                              className="inline-flex items-center gap-0.5 text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-50 ml-auto"
                              title={`Move to ${COLUMNS[colIndex + 1].title}`}
                            >
                              <span className="text-[10px]">{COLUMNS[colIndex + 1].title}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300/80 rounded-2xl">
                    <span>No tasks in {col.title}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
