const express = require('express');
const router = express.Router();
const multer = require('multer');
const { reviewCodeEndpoint, analyzeResumeEndpoint, getDashboardAnalytics } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Multer memory storage configuration (holds buffer in memory, no local uploads directory needed)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB maximum file size
});

router.post('/code-review', protect, reviewCodeEndpoint);
router.post('/resume-analyze', protect, upload.single('resume'), analyzeResumeEndpoint);
router.get('/dashboard', protect, getDashboardAnalytics);

module.exports = router;
