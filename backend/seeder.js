const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@workflow.com',
        password: 'password123',
        role: 'admin',
        department: 'Executive Management',
        designation: 'System Administrator',
        phone: '+1 (555) 019-2834',
        isActive: true,
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@workflow.com',
        password: 'password123',
        role: 'user',
        department: 'Product Management',
        designation: 'Senior Product Lead',
        phone: '+1 (555) 018-9921',
        isActive: true,
      },
      {
        name: 'Alex Morgan',
        email: 'alex.morgan@workflow.com',
        password: 'password123',
        role: 'user',
        department: 'Engineering',
        designation: 'Lead Full-Stack Developer',
        phone: '+1 (555) 014-4432',
        isActive: true,
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@workflow.com',
        password: 'password123',
        role: 'user',
        department: 'Design & UX',
        designation: 'Lead Product Designer',
        phone: '+1 (555) 017-8812',
        isActive: true,
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@workflow.com',
        password: 'password123',
        role: 'user',
        department: 'Engineering',
        designation: 'Senior DevOps & Cloud Architect',
        phone: '+1 (555) 012-3345',
        isActive: true,
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@workflow.com',
        password: 'password123',
        role: 'user',
        department: 'Quality Assurance',
        designation: 'Senior Automation QA Engineer',
        phone: '+1 (555) 016-7789',
        isActive: true,
      },
    ]);

    const admin = users[0];
    const sarah = users[1];
    const alex = users[2];
    const emily = users[3];
    const michael = users[4];
    const david = users[5];

    console.log('Creating projects...');
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const projects = await Project.create([
      {
        name: 'WorkFlow Enterprise Platform',
        description: 'Comprehensive enterprise task and project lifecycle management system with role-based governance, analytics, and collaboration tools.',
        manager: admin._id,
        members: [admin._id, sarah._id, alex._id, emily._id, michael._id, david._id],
        status: 'in-progress',
        priority: 'critical',
        startDate: twoMonthsAgo,
        endDate: twoMonthsLater,
        createdBy: admin._id,
        tags: ['MERN', 'SaaS', 'Core Engine', 'React'],
      },
      {
        name: 'Customer Portal & Mobile App',
        description: 'Responsive customer client interface offering self-service billing, ticket management, and real-time status updates.',
        manager: sarah._id,
        members: [sarah._id, alex._id, emily._id],
        status: 'in-progress',
        priority: 'high',
        startDate: oneMonthAgo,
        endDate: oneMonthLater,
        createdBy: admin._id,
        tags: ['Mobile', 'Customer Portal', 'React Native'],
      },
      {
        name: 'Cloud Infrastructure Migration & Kubernetes',
        description: 'Migrating legacy monolith servers to containerized microservices orchestrated on AWS EKS with zero-downtime deployment pipelines.',
        manager: michael._id,
        members: [michael._id, alex._id, admin._id],
        status: 'planning',
        priority: 'high',
        startDate: now,
        endDate: threeMonthsLater,
        createdBy: admin._id,
        tags: ['DevOps', 'AWS', 'Kubernetes', 'CI/CD'],
      },
      {
        name: 'Design System & Brand Refresh v2.0',
        description: 'Revamping enterprise design guidelines, component token libraries, typography, and accessibility (WCAG 2.1 AA compliant).',
        manager: emily._id,
        members: [emily._id, alex._id],
        status: 'completed',
        priority: 'medium',
        startDate: twoMonthsAgo,
        endDate: oneMonthAgo,
        createdBy: admin._id,
        tags: ['Design', 'Figma', 'Tailwind', 'Accessibility'],
      },
      {
        name: 'Automated Security Audit & Compliance',
        description: 'SOC2 Type II compliance audit, penetration testing, automated static and dynamic code security scanners integration.',
        manager: admin._id,
        members: [admin._id, david._id, michael._id],
        status: 'on-hold',
        priority: 'medium',
        startDate: oneMonthAgo,
        endDate: oneMonthLater,
        createdBy: admin._id,
        tags: ['Security', 'SOC2', 'Audit', 'Penetration Testing'],
      },
    ]);

    const pWorkflow = projects[0];
    const pPortal = projects[1];
    const pCloud = projects[2];
    const pDesign = projects[3];
    const pSecurity = projects[4];

    console.log('Creating tasks...');
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const tasks = await Task.create([
      // Tasks for WorkFlow Enterprise Platform
      {
        title: 'Design high-fidelity interactive wireframes for Kanban Board',
        description: 'Create Figma prototypes showcasing drag-and-drop interactions, card hover states, column sorting, and filter panels.',
        project: pWorkflow._id,
        assignedTo: emily._id,
        createdBy: admin._id,
        status: 'completed',
        priority: 'high',
        startDate: twoMonthsAgo,
        dueDate: threeDaysAgo,
        completedAt: threeDaysAgo,
        tags: ['UI/UX', 'Figma', 'Kanban'],
      },
      {
        title: 'Implement JWT authentication & RBAC middleware in Express',
        description: 'Secure all REST API routes with verifyToken, role-based authorization for admin vs user, and rate limiting against brute-force attacks.',
        project: pWorkflow._id,
        assignedTo: alex._id,
        createdBy: admin._id,
        status: 'completed',
        priority: 'critical',
        startDate: oneMonthAgo,
        dueDate: yesterday,
        completedAt: yesterday,
        tags: ['Backend', 'Security', 'JWT', 'RBAC'],
      },
      {
        title: 'Build Interactive Dashboard Analytics with Recharts',
        description: 'Develop charts for project completion, monthly velocity, task status breakdowns, and user assignment distribution cards.',
        project: pWorkflow._id,
        assignedTo: alex._id,
        createdBy: admin._id,
        status: 'in-progress',
        priority: 'high',
        startDate: threeDaysAgo,
        dueDate: inFiveDays,
        tags: ['Frontend', 'Recharts', 'Analytics'],
      },
      {
        title: 'Setup Multer File Upload with local and Cloudinary storage',
        description: 'Configure multi-part file uploads for task attachments, project logos, and user avatars with strict MIME type and size checks.',
        project: pWorkflow._id,
        assignedTo: michael._id,
        createdBy: admin._id,
        status: 'in-progress',
        priority: 'medium',
        startDate: yesterday,
        dueDate: inTwoDays,
        tags: ['Backend', 'Storage', 'Multer'],
      },
      {
        title: 'Perform cross-browser end-to-end integration testing',
        description: 'Run automated end-to-end verification covering user registration, project creation, task status progression, and reports generation.',
        project: pWorkflow._id,
        assignedTo: david._id,
        createdBy: admin._id,
        status: 'review',
        priority: 'high',
        startDate: threeDaysAgo,
        dueDate: inTwoDays,
        tags: ['QA', 'Testing', 'E2E'],
      },
      {
        title: 'Implement full-text search with regex and index optimization',
        description: 'Ensure tasks, projects, and users can be searched seamlessly with compound filters by status, priority, and assignees with server-side pagination.',
        project: pWorkflow._id,
        assignedTo: alex._id,
        createdBy: admin._id,
        status: 'todo',
        priority: 'critical',
        startDate: now,
        dueDate: inTwoWeeks,
        tags: ['MongoDB', 'Search', 'Pagination'],
      },
      {
        title: 'Overdue Sprint Retrospective Action Items Review',
        description: 'Finalize action points from the Q3 architecture review and resolve unresolved technical debt tickets.',
        project: pWorkflow._id,
        assignedTo: sarah._id,
        createdBy: admin._id,
        status: 'todo',
        priority: 'high',
        startDate: twoMonthsAgo,
        dueDate: yesterday, // Intentionally overdue
        tags: ['Agile', 'Sprint', 'Debt'],
      },

      // Tasks for Customer Portal & Mobile App
      {
        title: 'Design mobile responsive login and dashboard screens',
        description: 'Ensure fluid layouts across iOS and Android screen resolutions with support for dark/light themes.',
        project: pPortal._id,
        assignedTo: emily._id,
        createdBy: sarah._id,
        status: 'completed',
        priority: 'medium',
        startDate: oneMonthAgo,
        dueDate: threeDaysAgo,
        completedAt: threeDaysAgo,
        tags: ['Mobile', 'UI'],
      },
      {
        title: 'Implement Push Notification Service using Firebase Cloud Messaging',
        description: 'Send instant alerts when tasks are assigned, status updates occur, or deadlines are within 24 hours.',
        project: pPortal._id,
        assignedTo: alex._id,
        createdBy: sarah._id,
        status: 'in-progress',
        priority: 'medium',
        startDate: yesterday,
        dueDate: inFiveDays,
        tags: ['Mobile', 'Notifications'],
      },
      {
        title: 'API rate limiting and DDoS protection with Redis cache',
        description: 'Configure edge rate limiting on public facing endpoints to prevent abuse and brute force attempts.',
        project: pPortal._id,
        assignedTo: michael._id,
        createdBy: sarah._id,
        status: 'review',
        priority: 'critical',
        startDate: threeDaysAgo,
        dueDate: inTwoDays,
        tags: ['Security', 'API', 'DevOps'],
      },

      // Tasks for Cloud Infrastructure
      {
        title: 'Terraform scripts for AWS EKS cluster provisioning',
        description: 'Infrastructure as Code template for deploying multi-AZ Kubernetes cluster with auto-scaling worker node groups.',
        project: pCloud._id,
        assignedTo: michael._id,
        createdBy: admin._id,
        status: 'todo',
        priority: 'high',
        startDate: now,
        dueDate: inTwoWeeks,
        tags: ['Terraform', 'AWS', 'Kubernetes'],
      },
      {
        title: 'Prometheus & Grafana centralized monitoring setup',
        description: 'Setup cluster health dashboards, alert manager rules, and container resource utilization metrics.',
        project: pCloud._id,
        assignedTo: michael._id,
        createdBy: admin._id,
        status: 'todo',
        priority: 'medium',
        startDate: now,
        dueDate: inTwoWeeks,
        tags: ['Monitoring', 'Grafana'],
      },

      // Tasks for Design System
      {
        title: 'Audit existing color palette and establish design tokens',
        description: 'Standardize brand primary, secondary, neutral, success, warning, and error tokens across all products.',
        project: pDesign._id,
        assignedTo: emily._id,
        createdBy: admin._id,
        status: 'completed',
        priority: 'medium',
        startDate: twoMonthsAgo,
        dueDate: oneMonthAgo,
        completedAt: oneMonthAgo,
        tags: ['Design', 'Tokens'],
      },
      {
        title: 'Publish React Tailwind Component Library to private npm registry',
        description: 'Export reusable Button, Card, Modal, Input, Badge, and Table components with comprehensive Storybook documentation.',
        project: pDesign._id,
        assignedTo: alex._id,
        createdBy: admin._id,
        status: 'completed',
        priority: 'high',
        startDate: twoMonthsAgo,
        dueDate: oneMonthAgo,
        completedAt: oneMonthAgo,
        tags: ['Tailwind', 'React', 'Storybook'],
      },

      // Tasks for Security Audit
      {
        title: 'Static Application Security Testing (SAST) pipeline integration',
        description: 'Incorporate SonarQube and Snyk vulnerability checks into the GitHub Actions CI workflow on every pull request.',
        project: pSecurity._id,
        assignedTo: david._id,
        createdBy: admin._id,
        status: 'todo',
        priority: 'high',
        startDate: oneMonthAgo,
        dueDate: inTwoWeeks,
        tags: ['Security', 'CI/CD', 'SonarQube'],
      },
    ]);

    console.log('Creating activity logs...');
    await ActivityLog.create([
      {
        user: admin._id,
        action: 'created_project',
        entity: 'project',
        entityId: pWorkflow._id,
        entityName: pWorkflow.name,
        description: 'Created project: WorkFlow Enterprise Platform',
      },
      {
        user: admin._id,
        action: 'created_task',
        entity: 'task',
        entityId: tasks[0]._id,
        entityName: tasks[0].title,
        description: `Created task: ${tasks[0].title}`,
      },
      {
        user: emily._id,
        action: 'updated_task_status',
        entity: 'task',
        entityId: tasks[0]._id,
        entityName: tasks[0].title,
        description: 'Changed task status from review to completed: Design high-fidelity interactive wireframes for Kanban Board',
      },
      {
        user: alex._id,
        action: 'updated_task_status',
        entity: 'task',
        entityId: tasks[1]._id,
        entityName: tasks[1].title,
        description: 'Changed task status from in-progress to completed: Implement JWT authentication & RBAC middleware in Express',
      },
      {
        user: admin._id,
        action: 'created_user',
        entity: 'user',
        entityId: sarah._id,
        entityName: sarah.name,
        description: 'Created user Sarah Jenkins',
      },
      {
        user: admin._id,
        action: 'login',
        entity: 'auth',
        entityId: admin._id,
        entityName: admin.name,
        description: 'Admin User logged in',
      },
    ]);

    console.log('Database seeded successfully!');
    console.log(`Created: ${users.length} users, ${projects.length} projects, ${tasks.length} tasks`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
