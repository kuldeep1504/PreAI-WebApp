const express = require('express');
const router = express.Router();
const { updateProfile, buildRoadmap } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.post('/roadmap', protect, buildRoadmap);

module.exports = router;
