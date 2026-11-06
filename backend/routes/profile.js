const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
} = require('../controllers/profileController');

router.use(protect);

router.get('/', getProfile);

router.put(
  '/',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    validate,
  ],
  updateProfile
);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  changePassword
);

// Profile image upload
router.put('/image', (req, res, next) => {
  req.uploadType = 'profile';
  next();
}, upload.single('image'), uploadProfileImage);

module.exports = router;
