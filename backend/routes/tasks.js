const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(
    authorize('admin'),
    [
      body('title').trim().notEmpty().withMessage('Task title is required'),
      body('project').notEmpty().withMessage('Project is required').isMongoId().withMessage('Invalid project ID'),
      body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'review', 'completed'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority'),
      validate,
    ],
    createTask
  );

router
  .route('/:id')
  .get(getTask)
  .put(
    [
      body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty'),
      body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'review', 'completed'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority'),
      validate,
    ],
    updateTask
  )
  .delete(authorize('admin'), deleteTask);

module.exports = router;
