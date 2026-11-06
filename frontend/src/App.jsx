import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Protected Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectCreatePage } from './pages/ProjectCreatePage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProjectEditPage } from './pages/ProjectEditPage';
import { TasksListPage } from './pages/TasksListPage';
import { TaskCreatePage } from './pages/TaskCreatePage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { TaskEditPage } from './pages/TaskEditPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage';
import { UsersListPage } from './pages/UsersListPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin route guard
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected Workspace Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Projects */}
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route
                path="/projects/create"
                element={
                  <AdminRoute>
                    <ProjectCreatePage />
                  </AdminRoute>
                }
              />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route
                path="/projects/:id/edit"
                element={
                  <AdminRoute>
                    <ProjectEditPage />
                  </AdminRoute>
                }
              />

              {/* Tasks */}
              <Route path="/tasks" element={<TasksListPage />} />
              <Route path="/tasks/create" element={<TaskCreatePage />} />
              <Route path="/tasks/:id" element={<TaskDetailsPage />} />
              <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
              <Route path="/kanban" element={<KanbanBoardPage />} />

              {/* Users (Admin Only) */}
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UsersListPage />
                  </AdminRoute>
                }
              />

              {/* Profile & Analytics & Audit */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/activity" element={<ActivityLogsPage />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
