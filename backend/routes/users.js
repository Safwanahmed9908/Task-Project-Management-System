const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
      validate,
    ],
    createUser
  );

router
  .route('/:id')
  .get(getUser)
  .put(
    [
      body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
      body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
      validate,
    ],
    updateUser
  )
  .delete(deleteUser);

module.exports = router;
