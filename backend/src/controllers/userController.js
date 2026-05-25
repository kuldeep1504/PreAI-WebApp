const User = require('../models/User');
const { generateRoadmap } = require('../config/gemini');

// @desc    Update user profile data
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { skills, education, experience, targetCompany, targetRole, preferredLanguage, weakAreas, skillLevel } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update profile object properties
    user.profile.skills = skills || user.profile.skills;
    user.profile.education = education || user.profile.education;
    user.profile.experience = typeof experience !== 'undefined' ? experience : user.profile.experience;
    user.profile.targetCompany = targetCompany || user.profile.targetCompany;
    user.profile.targetRole = targetRole || user.profile.targetRole;
    user.profile.preferredLanguage = preferredLanguage || user.profile.preferredLanguage;
    user.profile.weakAreas = weakAreas || user.profile.weakAreas;
    user.profile.skillLevel = skillLevel || user.profile.skillLevel;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// @desc    Generate personalized 7-day preparation roadmap via Gemini AI
// @route   POST /api/user/roadmap
// @access  Private
const buildRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { targetRole, targetCompany, skillLevel, experience, preferredLanguage, weakAreas } = user.profile;

    if (!targetRole || !targetCompany) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your target career details (Role and Target Company) before generating a roadmap.' 
      });
    }

    console.log(`🗺️ Generating AI Roadmap for ${user.name}... (${targetRole} at ${targetCompany})`);

    const roadmapData = await generateRoadmap(
      targetRole,
      targetCompany,
      skillLevel,
      experience,
      preferredLanguage,
      weakAreas
    );

    // Save roadmap in user profile
    user.profile.roadmap = roadmapData;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'AI Personalized Preparation Roadmap generated successfully',
      roadmap: roadmapData
    });
  } catch (error) {
    console.error('Build roadmap error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error generating AI roadmap' });
  }
};

module.exports = {
  updateProfile,
  buildRoadmap
};
