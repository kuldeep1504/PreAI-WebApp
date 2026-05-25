const express = require('express');
const router = express.Router();
const { getAdminStats, updateUserRole, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getAdminStats);
router.put('/role/:id', protect, adminOnly, updateUserRole);
router.delete('/user/:id', protect, adminOnly, deleteUser);

module.exports = router;
