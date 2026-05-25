const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  profile: {
    skills: { type: [String], default: [] },
    education: { type: [String], default: [] },
    experience: { type: Number, default: 0 },
    targetCompany: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'JavaScript' },
    weakAreas: { type: String, default: '' },
    skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    roadmap: {
      type: Object,
      default: null
    }
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
