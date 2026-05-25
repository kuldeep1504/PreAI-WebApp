const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  targetCompany: {
    type: String,
    required: true
  },
  roundType: {
    type: String,
    enum: ['Technical', 'HR', 'Behavioral', 'Coding', 'Aptitude'],
    default: 'Technical'
  },
  status: {
    type: String,
    enum: ['started', 'completed'],
    default: 'started'
  },
  questions: [
    {
      questionId: { type: String, required: true },
      question: { type: String, required: true },
      userAnswer: { type: String, default: '' },
      evaluation: {
        type: Object,
        default: null
      }
    }
  ],
  overallScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);
