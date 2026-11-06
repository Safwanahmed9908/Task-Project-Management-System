const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('WorkFlow – Full-Stack System Integration Test Suite');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // Helper fetch json
  async function api(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.error || `HTTP ${res.status}`);
      error.data = data;
      throw error;
    }
    return data;
  }

  // 1. Health check
  await test('GET /api/health returns 200 OK', async () => {
    const data = await api('/health');
    if (!data.success) throw new Error('Health check failed');
  });

  // 2. Auth Login (Admin)
  let adminToken = '';
  let adminUser = null;
  await test('POST /api/auth/login logs in Admin user', async () => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@workflow.com',
        password: 'password123',
      }),
    });
    if (!data.token || data.user.role !== 'admin') {
      throw new Error('Admin login failed or wrong role');
    }
    adminToken = data.token;
    adminUser = data.user;
  });

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 3. Auth Me
  await test('GET /api/auth/me returns current authenticated user', async () => {
    const data = await api('/auth/me', { headers: adminHeaders });
    if (data.user.email !== 'admin@workflow.com') {
      throw new Error('Wrong user returned');
    }
  });

  // 4. Dashboard Stats
  await test('GET /api/dashboard/stats returns metrics from MongoDB', async () => {
    const data = await api('/dashboard/stats', { headers: adminHeaders });
    if (typeof data.stats.totalProjects !== 'number' || typeof data.stats.totalTasks !== 'number') {
      throw new Error('Invalid dashboard stats structure');
    }
  });

  // 5. Dashboard Analytics
  await test('GET /api/dashboard/analytics returns Recharts chart feeds', async () => {
    const data = await api('/dashboard/analytics', { headers: adminHeaders });
    if (!Array.isArray(data.tasksByStatus) || !Array.isArray(data.projectProgress)) {
      throw new Error('Analytics arrays missing');
    }
  });

  // 6. Projects List with Filtering, Search & Pagination
  let testProjectId = '';
  await test('GET /api/projects with search and pagination works', async () => {
    const data = await api('/projects?page=1&limit=5&status=in-progress', {
      headers: adminHeaders,
    });
    if (!Array.isArray(data.projects) || data.projects.length === 0) {
      throw new Error('No projects returned');
    }
    testProjectId = data.projects[0]._id;
  });

  // 7. Project Details
  await test('GET /api/projects/:id returns single project with tasks', async () => {
    const data = await api(`/projects/${testProjectId}`, { headers: adminHeaders });
    if (!data.project || !data.project.name) {
      throw new Error('Project not found');
    }
  });

  // 8. Create Project (CRUD)
  let createdProjectId = '';
  await test('POST /api/projects creates a new project in MongoDB', async () => {
    const data = await api('/projects', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Automated Test Initiative 2026',
        description: 'Comprehensive automated test project for validation of Term Work 3.',
        status: 'planning',
        priority: 'high',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        tags: ['Automated', 'Verification'],
      }),
    });
    if (!data.project?._id) throw new Error('Project creation failed');
    createdProjectId = data.project._id;
  });

  // 9. Update Project (CRUD)
  await test('PUT /api/projects/:id updates project data', async () => {
    const data = await api(`/projects/${createdProjectId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'in-progress' }),
    });
    if (data.project.status !== 'in-progress') throw new Error('Status not updated');
  });

  // 10. Tasks List with Multi-filters & Pagination
  let testTaskId = '';
  await test('GET /api/tasks with filters, sorting, and pagination', async () => {
    const data = await api('/tasks?page=1&limit=10&sortBy=dueDate&sortOrder=asc', {
      headers: adminHeaders,
    });
    if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
      throw new Error('No tasks returned');
    }
    testTaskId = data.tasks[0]._id;
  });

  // 11. Create Task (CRUD)
  let createdTaskId = '';
  await test('POST /api/tasks creates task in MongoDB', async () => {
    const data = await api('/tasks', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Perform Automated Integration Check',
        description: 'Verifies backend endpoints and database queries',
        project: createdProjectId,
        status: 'todo',
        priority: 'critical',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      }),
    });
    if (!data.task?._id) throw new Error('Task creation failed');
    createdTaskId = data.task._id;
  });

  // 12. Update Task Status (Kanban Transition)
  await test('PUT /api/tasks/:id updates status to completed (Kanban transition)', async () => {
    const data = await api(`/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'completed' }),
    });
    if (data.task.status !== 'completed' || !data.task.completedAt) {
      throw new Error('Task status or completedAt timestamp not set');
    }
  });

  // 13. Users Management (Admin Only)
  let createdUserId = '';
  await test('POST /api/users creates a user with validation (Admin)', async () => {
    const data = await api('/users', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Test Team Member',
        email: `tester_${Date.now()}@workflow.com`,
        password: 'password123',
        role: 'user',
        department: 'Quality Assurance',
        designation: 'Integration Tester',
      }),
    });
    if (!data.user?._id) throw new Error('User creation failed');
    createdUserId = data.user._id;
  });

  // 14. Activity Logs
  await test('GET /api/activity returns immutable audit logs', async () => {
    const data = await api('/activity?page=1&limit=5', { headers: adminHeaders });
    if (!Array.isArray(data.logs) || data.logs.length === 0) {
      throw new Error('No activity logs returned');
    }
  });

  // 15. Delete Task
  await test('DELETE /api/tasks/:id deletes created task', async () => {
    const data = await api(`/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!data.success) throw new Error('Task deletion failed');
  });

  // 16. Delete Project
  await test('DELETE /api/projects/:id deletes created project', async () => {
    const data = await api(`/projects/${createdProjectId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!data.success) throw new Error('Project deletion failed');
  });

  // 17. Delete User
  await test('DELETE /api/users/:id deletes created user', async () => {
    const data = await api(`/users/${createdUserId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!data.success) throw new Error('User deletion failed');
  });

  console.log('\n==================================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests();
