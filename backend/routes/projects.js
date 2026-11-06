const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(
    authorize('admin'),
    [
      body('name').trim().notEmpty().withMessage('Project name is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
      body('startDate').isISO8601().withMessage('Please provide a valid start date'),
      body('endDate').isISO8601().withMessage('Please provide a valid end date'),
      body('status')
        .optional()
        .isIn(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority'),
      validate,
    ],
    createProject
  );

router
  .route('/:id')
  .get(getProject)
  .put(
    [
      body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
      body('status')
        .optional()
        .isIn(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority'),
      validate,
    ],
    updateProject
  )
  .delete(authorize('admin'), deleteProject);

module.exports = router;
