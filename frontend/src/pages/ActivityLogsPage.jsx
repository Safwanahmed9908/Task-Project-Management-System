import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  FolderKanban,
  CheckSquare,
  Shield,
  FileText,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner, TableSkeleton } from '../components/common/LoadingSpinner';

export const ActivityLogsPage = () => {
  const { isAdmin } = useAuth();
  const { error } = useToast();

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [entity, setEntity] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      api.get('/users?limit=100').then((res) => {
        if (res.data.success) setUsers(res.data.users);
      });
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        entity: entity !== 'all' ? entity : undefined,
        userId: selectedUser !== 'all' ? selectedUser : undefined,
      };

      const res = await api.get('/activity', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
        setTotalPages(res.data.pages);
        setTotalLogs(res.data.total);
      }
    } catch (err) {
      error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entity, selectedUser]);

  const getEntityIcon = (type) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-600" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-indigo-600" />;
      case 'user':
        return <User className="w-4 h-4 text-emerald-600" />;
      case 'auth':
        return <Shield className="w-4 h-4 text-amber-600" />;
      case 'file':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-blue-600" />
          <span>System Activity Logs</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Immutable audit trail of system events, logins, and project mutations ({totalLogs} recorded)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Entity filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Module:</span>
          <select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">All Modules</option>
            <option value="project">Projects</option>
            <option value="task">Tasks</option>
            <option value="user">Users</option>
            <option value="auth">Authentication</option>
            <option value="file">Files & Attachments</option>
          </select>
        </div>

        {/* User filter (Admin only) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Actor:</span>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-700 font-medium"
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Activity Logs Feed */}
      {loading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity recorded"
          description="Actions performed in WorkFlow will automatically appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log._id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                    {getEntityIcon(log.entity)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-800 leading-relaxed">
                      <span className="font-semibold text-slate-900">{log.user?.name || 'User'}</span>{' '}
                      <span>{log.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="font-medium uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {log.entity}
                      </span>
                      <span>•</span>
                      <span>{log.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalLogs}
            limit={15}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
