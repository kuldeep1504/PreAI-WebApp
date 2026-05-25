const Interview = require('../models/Interview');
const Report = require('../models/Report');
const User = require('../models/User');
const { generateInterviewQuestions, evaluateAnswer } = require('../config/gemini');

// @desc    Initialize a new AI Mock Interview Session
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { roundType } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { targetRole, targetCompany } = user.profile;
    if (!targetRole || !targetCompany) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your career goal profile (Target Role & Target Company) before starting an interview.' 
      });
    }

    console.log(`🎙️ Starting ${roundType} interview for ${user.name} targeting ${targetCompany}...`);

    // Generate Tailored Questions from Gemini
    const rawQuestions = await generateInterviewQuestions(targetRole, targetCompany, roundType || 'Technical', 5);
    
    const formattedQuestions = rawQuestions.map(q => ({
      questionId: q.id || Math.random().toString(36).substr(2, 9),
      question: q.question,
      userAnswer: '',
      evaluation: null
    }));

    // Create Interview Document
    const interview = await Interview.create({
      user: user._id,
      targetRole,
      targetCompany,
      roundType: roundType || 'Technical',
      status: 'started',
      questions: formattedQuestions,
      overallScore: 0
    });

    return res.status(201).json({
      success: true,
      message: 'Interview session initialized successfully.',
      interview
    });
  } catch (error) {
    console.error('Start interview error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error starting interview' });
  }
};

// @desc    Submit user response for a specific question & evaluate in real-time
// @route   POST /api/interview/:id/answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer, eyeContactScore, confidenceScore, calmnessScore } = req.body;
    const interviewId = req.params.id;

    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Question ID is required' });
    }

    const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const questionIndex = interview.questions.findIndex(q => q.questionId === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question not found in this session' });
    }

    console.log(`📝 Evaluating response for question ${questionId} in interview ${interviewId}...`);

    // Evaluate answer via Gemini API helper
    const evaluation = await evaluateAnswer(
      interview.questions[questionIndex].question,
      userAnswer || 'No answer provided.',
      interview.targetRole,
      interview.targetCompany
    );

    // Save answer and evaluation
    interview.questions[questionIndex].userAnswer = userAnswer || '';
    interview.questions[questionIndex].evaluation = {
      ...evaluation,
      facialExpressionAnalysis: {
        eyeContactScore: eyeContactScore || 80,
        confidenceScore: confidenceScore || 85,
        calmnessScore: calmnessScore || 75
      }
    };

    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer submitted and graded successfully',
      question: interview.questions[questionIndex]
    });
  } catch (error) {
    console.error('Submit answer error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error processing answer' });
  }
};

// @desc    Complete interview and generate overall evaluation report
// @route   POST /api/interview/:id/complete
// @access  Private
const completeInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status === 'completed') {
      const existingReport = await Report.findOne({ interview: interviewId });
      return res.status(200).json({
        success: true,
        message: 'Interview was already completed',
        interview,
        report: existingReport
      });
    }

    // Set Status
    interview.status = 'completed';

    // Calculate aggregated score metrics
    let totalQuestions = 0;
    let technicalSum = 0;
    let communicationSum = 0;
    let eyeContactSum = 0;
    let confidenceSum = 0;
    let calmnessSum = 0;

    let strengths = [];
    let weaknesses = [];
    let improvements = [];

    interview.questions.forEach(q => {
      if (q.evaluation) {
        totalQuestions++;
        technicalSum += q.evaluation.technicalAccuracy || 50;
        communicationSum += q.evaluation.communicationScore || 50;
        
        if (q.evaluation.facialExpressionAnalysis) {
          eyeContactSum += q.evaluation.facialExpressionAnalysis.eyeContactScore || 80;
          confidenceSum += q.evaluation.facialExpressionAnalysis.confidenceScore || 85;
          calmnessSum += q.evaluation.facialExpressionAnalysis.calmnessScore || 75;
        }

        if (q.evaluation.strengths) strengths.push(...q.evaluation.strengths);
        if (q.evaluation.weaknesses) weaknesses.push(...q.evaluation.weaknesses);
      }
    });

    // Default averages if no scores were registered
    const finalTechnical = totalQuestions > 0 ? Math.round(technicalSum / totalQuestions) : 70;
    const finalCommunication = totalQuestions > 0 ? Math.round(communicationSum / totalQuestions) : 70;
    const finalOverall = Math.round((finalTechnical + finalCommunication) / 2);

    const finalEyeContact = totalQuestions > 0 ? Math.round(eyeContactSum / totalQuestions) : 80;
    const finalConfidence = totalQuestions > 0 ? Math.round(confidenceSum / totalQuestions) : 85;
    const finalCalmness = totalQuestions > 0 ? Math.round(calmnessSum / totalQuestions) : 75;

    // Filter unique values
    strengths = [...new Set(strengths)].slice(0, 4);
    weaknesses = [...new Set(weaknesses)].slice(0, 4);

    // Standard constructive improvements
    improvements = weaknesses.map(w => `Dedicate extra time to: ${w.toLowerCase()}`);
    if (improvements.length === 0) {
      improvements = [
        "Include more concrete metrics/impact numbers in technical explanations.",
        "Ensure structural pacing: spend 10% on intro, 70% on implementation details, 20% on edge-cases."
      ];
    }

    interview.overallScore = finalOverall;
    await interview.save();

    // Create Report
    const report = await Report.create({
      interview: interview._id,
      user: req.user.id,
      overallScore: finalOverall,
      technicalScore: finalTechnical,
      communicationScore: finalCommunication,
      confidenceLevel: finalConfidence > 80 ? 'High' : finalConfidence > 50 ? 'Medium' : 'Low',
      strengths,
      weaknesses,
      improvements,
      facialExpressionAnalysis: {
        eyeContactScore: finalEyeContact,
        confidenceScore: finalConfidence,
        calmnessScore: finalCalmness
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Interview completed and evaluation report generated.',
      interview,
      report
    });
  } catch (error) {
    console.error('Complete interview error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error completing interview' });
  }
};

// @desc    Get user interview history and metrics
// @route   GET /api/interview/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const { company, type } = req.query;
    let filter = { user: req.user.id, status: 'completed' };

    if (company) {
      filter.targetCompany = new RegExp(company, 'i');
    }
    if (type) {
      filter.roundType = type;
    }

    const interviews = await Interview.find(filter).sort({ createdAt: -1 });
    
    // Fetch associated reports
    const interviewIds = interviews.map(i => i._id);
    const reports = await Report.find({ interview: { $in: interviewIds } });

    // Map together
    const formattedHistory = interviews.map(item => {
      const report = reports.find(r => r.interview.toString() === item._id.toString());
      return {
        _id: item._id,
        targetCompany: item.targetCompany,
        targetRole: item.targetRole,
        roundType: item.roundType,
        overallScore: item.overallScore,
        createdAt: item.createdAt,
        reportId: report ? report._id : null
      };
    });

    return res.status(200).json({
      success: true,
      history: formattedHistory
    });
  } catch (error) {
    console.error('Get history error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching history' });
  }
};

// @desc    Get specific evaluation report details
// @route   GET /api/interview/report/:id
// @access  Private
const getReportDetail = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user.id })
      .populate({
        path: 'interview',
        select: 'questions targetCompany targetRole roundType createdAt'
      });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Evaluation report not found' });
    }

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get report detail error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching report details' });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getHistory,
  getReportDetail
};
