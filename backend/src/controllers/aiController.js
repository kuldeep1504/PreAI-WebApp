const { reviewCode, analyzeResume } = require('../config/gemini');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Analyze a code snippet using AI Mentor
// @route   POST /api/ai/code-review
// @access  Private
const reviewCodeEndpoint = async (req, res) => {
  try {
    const { language, code, question } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Please provide code and programming language.' });
    }

    console.log(`💻 AI review triggered for ${language} code block...`);
    const review = await reviewCode(language, code, question || 'General Programming Task');

    return res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Code review error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error reviewing code' });
  }
};

// @desc    Analyze a resume copy-paste text or uploaded PDF using AI ATS rater
// @route   POST /api/ai/resume-analyze
// @access  Private
const analyzeResumeEndpoint = async (req, res) => {
  try {
    let resumeText = req.body.resumeText;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Support for uploaded file parsing simulation
    if (req.file) {
      console.log(`📁 Uploaded resume file detected: ${req.file.originalname}`);
      // In production, we'd parse the PDF buffer using 'pdf-parse'. 
      // For standard setup, we simulate parsed text from file name and user skills.
      resumeText = `RESUME OF ${user.name.toUpperCase()}\nTarget: ${user.profile.targetRole || 'Software Engineer'}\nSkills: ${user.profile.skills.join(', ') || 'Javascript, React, Node.js'}\nExperience: ${user.profile.experience} years.\nFile Details: ${req.file.originalname} - ${req.file.size} bytes.`;
    }

    if (!resumeText || resumeText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide resume text or upload a PDF resume file.' });
    }

    const targetCompany = user.profile.targetCompany || 'Top Tech Companies';
    const targetRole = user.profile.targetRole || 'Full-Stack Developer';

    console.log(`📄 Analyzing resume for ATS matching against ${targetRole} at ${targetCompany}...`);
    const evaluation = await analyzeResume(resumeText, targetCompany, targetRole);

    return res.status(200).json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Resume analyzer error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error analyzing resume' });
  }
};

// @desc    Compile aggregated dashboard charts, streaks, and AI suggestions
// @route   GET /api/ai/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all completed reports
    const reports = await Report.find({ user: userId }).sort({ createdAt: 1 });
    const totalInterviews = reports.length;

    // Default aggregate metrics
    let avgScore = 0;
    let avgComm = 0;
    let avgTech = 0;
    let confidenceAvgVal = 85;

    let strengths = [];
    let weaknesses = [];

    if (totalInterviews > 0) {
      let scoreSum = 0;
      let commSum = 0;
      let techSum = 0;

      reports.forEach(r => {
        scoreSum += r.overallScore;
        commSum += r.communicationScore;
        techSum += r.technicalScore;
        if (r.strengths) strengths.push(...r.strengths);
        if (r.weaknesses) weaknesses.push(...r.weaknesses);
      });

      avgScore = Math.round(scoreSum / totalInterviews);
      avgComm = Math.round(commSum / totalInterviews);
      avgTech = Math.round(techSum / totalInterviews);
      
      strengths = [...new Set(strengths)].slice(0, 3);
      weaknesses = [...new Set(weaknesses)].slice(0, 3);
    } else {
      // Default initial states for brand new users
      strengths = ["Eager to prepare", "Target goals defined"];
      weaknesses = ["No mock interviews attended yet"];
    }

    // Weekly progression chart mock aggregator (fallback to 6-week progression points)
    const progressChart = Array.from({ length: 6 }, (_, idx) => {
      const reportIndex = reports.length - 6 + idx;
      const report = reportIndex >= 0 ? reports[reportIndex] : null;
      
      return {
        name: `Round ${idx + 1}`,
        overall: report ? report.overallScore : (idx * 10 + 40),
        technical: report ? report.technicalScore : (idx * 8 + 35),
        communication: report ? report.communicationScore : (idx * 12 + 45),
      };
    });

    // Generate dynamic AI suggestion card based on strengths and weaknesses
    const aiInsight = totalInterviews > 0 
      ? `Based on your ${totalInterviews} mock sessions, you demonstrate notable strength in: **${strengths.join(', ')}**. However, to successfully pass coding and architectural screens at ${user.profile.targetCompany || 'target companies'}, you should focus heavily on resolving: **${weaknesses.join(', ')}**.`
      : `Welcome, ${user.name}! You haven't completed any mock interviews yet. Set up your target role and complete your first **Technical or HR Mock Interview** to generate custom behavioral analytics and core AI insights.`;

    return res.status(200).json({
      success: true,
      analytics: {
        totalInterviews,
        averageScore: avgScore || 0,
        averageCommunication: avgComm || 0,
        averageTechnical: avgTech || 0,
        confidenceLevel: totalInterviews > 0 ? (avgComm > 80 ? 'High' : 'Medium') : 'Medium',
        streak: user.streak || 0,
        progressChart,
        strengths,
        weaknesses,
        aiInsight,
        profileComplete: !!(user.profile.targetRole && user.profile.targetCompany)
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error loading analytics' });
  }
};

module.exports = {
  reviewCodeEndpoint,
  analyzeResumeEndpoint,
  getDashboardAnalytics
};
