require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');

// Initialize database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // In development, allow broad access
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all general API requests
app.use('/api/', apiLimiter);

// Bind Route Handlers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'AI-Powered Interview Prep System Server is running.',
    time: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'An unexpected internal server error occurred.' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server fully operational on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
