const User = require('../models/User');
const Interview = require('../models/Interview');
const Report = require('../models/Report');

// @desc    Get aggregate metrics and user list for administrators
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const completedReports = await Report.countDocuments();

    // Get all users
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Calculate average platform score
    const reports = await Report.find({});
    const scoreSum = reports.reduce((acc, r) => acc + r.overallScore, 0);
    const avgPlatformScore = completedReports > 0 ? Math.round(scoreSum / completedReports) : 75;

    // Distribution by Interview Category
    const interviews = await Interview.find({});
    const distribution = {
      Technical: interviews.filter(i => i.roundType === 'Technical').length,
      HR: interviews.filter(i => i.roundType === 'HR').length,
      Behavioral: interviews.filter(i => i.roundType === 'Behavioral').length,
      Coding: interviews.filter(i => i.roundType === 'Coding').length,
      Aptitude: interviews.filter(i => i.roundType === 'Aptitude').length,
    };

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalInterviews,
        completedReports,
        avgPlatformScore,
        distribution,
        users
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error loading admin stats' });
  }
};

// @desc    Update a user's access role (Student/Admin toggle)
// @route   PUT /api/admin/role/:id
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please specify a valid role (student or admin).' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role for ${user.name} successfully updated to ${role}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update role error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
};

// @desc    Admin deletion of a user profile
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own profile.' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Purge user's interview history
    await Interview.deleteMany({ user: req.params.id });
    await Report.deleteMany({ user: req.params.id });

    return res.status(200).json({
      success: true,
      message: `User ${user.name} and associated records purged successfully.`
    });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error purging user profile' });
  }
};

module.exports = {
  getAdminStats,
  updateUserRole,
  deleteUser
};
