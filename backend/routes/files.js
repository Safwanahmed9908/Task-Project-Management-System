const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTaskFiles, deleteTaskFile } = require('../controllers/filesController');

router.use(protect);

router.get('/task/:taskId', getTaskFiles);
router.delete('/task/:taskId/:attachmentId', deleteTaskFile);

module.exports = router;
