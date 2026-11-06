const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadTaskFile, uploadProjectImage } = require('../controllers/uploadController');

router.use(protect);

// Upload file to task
router.post(
  '/task/:taskId',
  (req, res, next) => {
    req.uploadType = 'task';
    next();
  },
  upload.single('file'),
  uploadTaskFile
);

// Upload project image (admin only)
router.post(
  '/project/:projectId',
  authorize('admin'),
  (req, res, next) => {
    req.uploadType = 'project';
    next();
  },
  upload.single('image'),
  uploadProjectImage
);

module.exports = router;
