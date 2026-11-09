# WorkFlow – Advanced Task & Project Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade, full-stack Task & Project Management SaaS platform engineered with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Designed to fulfill all college **Term Work 3** specifications with real database persistence, JWT authentication, granular Role-Based Access Control (RBAC), interactive Kanban boards, Recharts analytics, and file upload capabilities.

---

## 📋 Table of Contents
1. [Project Objectives](#-project-objectives)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Authentication & Roles](#-authentication--roles)
6. [API Documentation](#-api-documentation)
7. [Installation & Setup](#-installation--setup)
8. [Database Seeding](#-database-seeding)
9. [Automated Test Suite](#-automated-test-suite)
10. [Deployment Guide](#-deployment-guide)
11. [Screenshots & UI Overview](#-screenshots--ui-overview)
12. [Future Enhancements](#-future-enhancements)

---

## 🎯 Project Objectives
- **Enterprise-Grade Governance:** Deliver strict server-side Role-Based Access Control (RBAC) separating Administrator capabilities from standard Team Member operations.
- **Real-Time Data Persistence:** Eliminate mock data or client-side storage; all tasks, projects, comments, files, and activity logs are permanently stored and queried in MongoDB.
- **Productive Agile Workflows:** Provide both table/list views and interactive Kanban boards allowing frictionless task lifecycle movement.
- **Actionable Business Intelligence:** Surface real-time metrics with Recharts, including completion velocities, backlog distributions, workload allocations, and overdue warnings.

---

## ✨ Key Features

### 1. Authentication & Security
- **JWT Authentication:** Secure token exchange stored in HTTP Authorization Bearers.
- **Password Protection:** Irreversible bcrypt hashing (12 salt rounds).
- **Session Continuity:** Instant session re-validation with `/api/auth/me`.
- **Forgot/Reset Password Flow:** Cryptographic token generation via email transport.
- **Security Middlewares:** Helmet HTTP header hardening, CORS cross-origin isolation, and rate-limiting against brute force attacks.

### 2. Project Lifecycle Management
- Complete CRUD (Create, Read, Update, Delete) with MongoDB transactions.
- Fields: Name, Description, Project Lead/Manager, Members array, Start/End Dates, Priority, Status, Tags.
- Real-time milestone progress tracking (% calculated dynamically from child tasks).
- Compound text search and filtering by Status (`Planning`, `In Progress`, `On Hold`, `Completed`, `Cancelled`) and Priority (`Low`, `Medium`, `High`, `Critical`).

### 3. Task Management & Kanban Board
- Comprehensive task attributes: Title, Description, Project reference, Assigned Member, Priority, Status, Timeline, Attachments, and Tags.
- **Kanban Board:** 4 columns (`To Do`, `In Progress`, `Review`, `Completed`) with instant state migration saved directly to MongoDB.
- **Overdue Task Tracking:** Automated flagging of overdue action items.
- Server-side compound search, multi-field filtering, sorting, and pagination.

### 4. Admin User Management & Profiles
- Admin console to provision new users, edit details, assign roles (`admin` vs `user`), toggle active status, and safely delete accounts.
- Profile settings allowing members to edit contact info, job title, department, upload avatars, and change passwords.

### 5. File & Image Upload System
- Multi-part file upload support powered by **Multer**.
- Profile image avatar updates and task file attachments with size (5MB) and MIME-type restrictions.
- Safe download routing via `/api/files/:type/:filename`.

### 6. Interactive Analytics & Audit Trail
- KPI summary metrics: Total Projects, Total Tasks, Pending, In Progress, Completed, Overdue, and Total Users.
- Recharts visualizations: Tasks by Status (Donut), Project Progress (Bar), Tasks by Priority (Bar), and Team Workload Allocation.
- Immutable activity audit log recording all system mutations with actor details and timestamps.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18.2 with Vite (fast HMR bundling)
- **Routing:** React Router DOM v6 (protected and role-guarded routes)
- **Styling:** Tailwind CSS v3 with modern enterprise design tokens
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios with request/response interceptors

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Handling:** Multer
- **Validation:** Express Validator
- **Security:** Helmet, CORS, Express Rate Limit

---

## 📁 Project Structure

```
WorkFlow/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx            # Status, Priority & Role badges
│   │   │   │   ├── EmptyState.jsx       # Empty state displays
│   │   │   │   ├── LoadingSpinner.jsx   # Spinners & Table/Card skeletons
│   │   │   │   ├── Modal.jsx            # Modals & ConfirmDialog
│   │   │   │   └── Pagination.jsx       # Server-side pagination controls
│   │   │   └── navigation/
│   │   │       ├── Navbar.jsx           # Top navbar with search & quick actions
│   │   │       └── Sidebar.jsx          # Role-aware collapsible sidebar
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # JWT authentication provider
│   │   │   └── ToastContext.jsx         # Global notifications system
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx           # Split layout for login/register
│   │   │   └── DashboardLayout.jsx      # Workspace wrapper
│   │   ├── pages/
│   │   │   ├── ActivityLogsPage.jsx     # System audit trail
│   │   │   ├── AnalyticsPage.jsx        # In-depth Recharts analytics
│   │   │   ├── DashboardPage.jsx        # Main enterprise KPI dashboard
│   │   │   ├── ForgotPasswordPage.jsx   # Password reset request
│   │   │   ├── KanbanBoardPage.jsx      # 4-Column interactive board
│   │   │   ├── LandingPage.jsx          # SaaS public landing page
│   │   │   ├── LoginPage.jsx            # Sign in with demo quick-switch
│   │   │   ├── NotFoundPage.jsx         # 404 handler
│   │   │   ├── ProfilePage.jsx          # User profile & password changer
│   │   │   ├── ProjectCreatePage.jsx    # Project creation form
│   │   │   ├── ProjectDetailsPage.jsx   # Detailed project overview
│   │   │   ├── ProjectEditPage.jsx      # Project edit form
│   │   │   ├── ProjectsListPage.jsx     # Projects table/grid view
│   │   │   ├── RegisterPage.jsx         # User registration form
│   │   │   ├── ResetPasswordPage.jsx    # Token-based password reset
│   │   │   ├── TaskCreatePage.jsx       # Task creation form
│   │   │   ├── TaskDetailsPage.jsx      # Task detail & attachments view
│   │   │   ├── TaskEditPage.jsx         # Task edit form
│   │   │   ├── TasksListPage.jsx        # Tasks table with multi-filters
│   │   │   └── UsersListPage.jsx        # Admin user management
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with interceptors
│   │   ├── App.jsx                      # Route definitions
│   │   ├── index.css                    # Tailwind CSS directives
│   │   └── main.jsx                     # React root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js                        # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── activityController.js        # Audit trail controller
│   │   ├── authController.js            # Registration, login & password reset
│   │   ├── dashboardController.js       # Stats & analytics aggregation
│   │   ├── profileController.js         # User profile & avatar update
│   │   ├── projectController.js         # Project CRUD
│   │   ├── taskController.js            # Task CRUD & Kanban moves
│   │   ├── uploadController.js          # File uploads
│   │   └── userController.js            # User management
│   ├── middleware/
│   │   ├── auth.js                      # JWT protect & authorize(roles)
│   │   ├── error.js                     # Global centralized error handler
│   │   ├── upload.js                    # Multer disk storage & filters
│   │   └── validate.js                  # Express-validator handler
│   ├── models/
│   │   ├── ActivityLog.js               # Audit log schema
│   │   ├── Project.js                   # Project schema with virtuals
│   │   ├── Task.js                      # Task schema with attachments
│   │   └── User.js                      # User schema with bcrypt hooks
│   ├── routes/                          # Express REST API routes
│   ├── services/
│   │   └── activityService.js           # Async audit logging helper
│   ├── tests/
│   │   └── apiTest.js                   # End-to-end API test suite
│   ├── uploads/                         # Upload storage directories
│   ├── seeder.js                        # Database seeder with sample data
│   ├── server.js                        # Express server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 🔒 Authentication and Roles

| Feature | Admin Role | User / Member Role |
| :--- | :---: | :---: |
| Access Global Dashboard | ✅ | ✅ (Assigned Projects & Tasks) |
| Create & Delete Projects | ✅ | ❌ |
| Create & Assign Tasks | ✅ | ❌ (View / Status Update permitted) |
| Update Task Status | ✅ | ✅ |
| Upload Attachments | ✅ | ✅ |
| Access Admin User Management | ✅ | ❌ |
| Edit Personal Profile & Photo | ✅ | ✅ |
| Change Account Password | ✅ | ✅ |
| View System Audit Logs | ✅ (All logs) | ✅ (Personal activity) |

### Pre-Configured Demo Credentials
- **Administrator:** `admin@workflow.com` / `password123`
- **Team Member:** `sarah.jenkins@workflow.com` / `password123`

---

## 🌐 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new account
- `POST /api/auth/login` - Authenticate and obtain JWT
- `POST /api/auth/logout` - Invalidate session & log activity
- `GET  /api/auth/me` - Retrieve current authenticated profile
- `POST /api/auth/forgot-password` - Request password reset email
- `PUT  /api/auth/reset-password/:token` - Reset password using token

### Projects
- `GET    /api/projects` - List projects (supports `?page=`, `?limit=`, `?search=`, `?status=`, `?priority=`, `?sortBy=`)
- `GET    /api/projects/:id` - Get project details with populated tasks
- `POST   /api/projects` - Create project *(Admin only)*
- `PUT    /api/projects/:id` - Update project *(Admin or Lead)*
- `DELETE /api/projects/:id` - Delete project and child tasks *(Admin only)*

### Tasks
- `GET    /api/tasks` - List tasks (supports `?project=`, `?assignedTo=`, `?status=`, `?priority=`, `?overdue=true`)
- `GET    /api/tasks/:id` - Get task details with attachments
- `POST   /api/tasks` - Create task *(Admin only)*
- `PUT    /api/tasks/:id` - Update task / change status *(Permitted users)*
- `DELETE /api/tasks/:id` - Delete task *(Admin only)*

### Dashboard & Analytics
- `GET /api/dashboard/stats` - KPI summary metrics
- `GET /api/dashboard/analytics` - Time-series and categorical chart feeds

### Users & Profile
- `GET    /api/users` - List users *(Admin only)*
- `POST   /api/users` - Create user *(Admin only)*
- `PUT    /api/users/:id` - Update user or toggle status *(Admin only)*
- `DELETE /api/users/:id` - Delete user account *(Admin only)*
- `GET    /api/profile` - Get logged-in user profile
- `PUT    /api/profile` - Update profile & avatar image
- `PUT    /api/profile/change-password` - Update account password

### Files & Attachments
- `POST /api/upload` - General multi-part file upload
- `POST /api/upload/task/:taskId` - Attach document to task
- `GET  /api/files/:type/:filename` - Secure file download

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB instance running locally on `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/WorkFlow.git
cd WorkFlow
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Ensure your `.env` contains valid configurations:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workflow
JWT_SECRET=workflow_super_secret_jwt_key_2024_college_project
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

---

## 📦 Database Seeding
Populate your MongoDB database with enterprise sample data (6 users, 5 projects across all statuses, 15 rich tasks, and audit logs):
```bash
cd backend
node seeder.js
```
Output:
```
MongoDB Connected for seeding
Clearing old data...
Creating users...
Creating projects...
Creating tasks...
Creating activity logs...
Database seeded successfully!
Created: 6 users, 5 projects, 15 tasks
```

---

## 🏃 Running the Application

### Start the Backend Server:
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

### Start the Frontend Client:
```bash
cd frontend
npm run dev
# Vite dev server running on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Automated Test Suite
WorkFlow includes an automated integration test verifying all 17 core backend endpoints and database constraints:
```bash
cd backend
node tests/apiTest.js
```
Test Output:
```
==================================================
WorkFlow – Full-Stack System Integration Test Suite
==================================================

✅ PASS: GET /api/health returns 200 OK
✅ PASS: POST /api/auth/login logs in Admin user
✅ PASS: GET /api/auth/me returns current authenticated user
✅ PASS: GET /api/dashboard/stats returns metrics from MongoDB
✅ PASS: GET /api/dashboard/analytics returns Recharts chart feeds
✅ PASS: GET /api/projects with search and pagination works
✅ PASS: GET /api/projects/:id returns single project with tasks
✅ PASS: POST /api/projects creates a new project in MongoDB
✅ PASS: PUT /api/projects/:id updates project data
✅ PASS: GET /api/tasks with filters, sorting, and pagination
✅ PASS: POST /api/tasks creates task in MongoDB
✅ PASS: PUT /api/tasks/:id updates status to completed (Kanban transition)
✅ PASS: POST /api/users creates a user with validation (Admin)
✅ PASS: GET /api/activity returns immutable audit logs
✅ PASS: DELETE /api/tasks/:id deletes created task
✅ PASS: DELETE /api/projects/:id deletes created project
✅ PASS: DELETE /api/users/:id deletes created user

==================================================
Test Results: 17 Passed, 0 Failed
==================================================
```

---

## 🚢 Deployment Guide

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection URI: `mongodb+srv://<username>:<password>@cluster.mongodb.net/workflow`.
3. Set `MONGODB_URI` in your backend deployment environment variables.

### Backend (Render / Railway)
1. Create a Web Service pointing to your GitHub repository with root directory `backend`.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<your-atlas-uri>`
   - `JWT_SECRET=<your-strong-random-key>`
   - `FRONTEND_URL=https://your-frontend.vercel.app`

### Frontend (Vercel / Netlify)
1. Import your GitHub repository into Vercel with root directory `frontend`.
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure API Proxy in `vercel.json` or point `VITE_API_URL` to your live backend URL.

---

## 🔮 Future Enhancements
- Real-time WebSocket notifications via Socket.io.
- Gantt Chart interactive roadmap visualization.
- GitHub / GitLab webhooks integration for automatic commit-to-task linking.
- Cloudinary asset upload adapter for cloud blob storage.
- Multi-tenant organizations with billing tiers.

---

## 👨‍💻 Author & Academic Submission
- **Project Title:** WorkFlow – Advanced Task & Project Management System
- **Developer:** Safwan
- **Stack:** MERN (MongoDB, Express, React, Node.js)
