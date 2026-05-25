import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Core components shell layout
import Layout from './components/Layout';

// Application pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CareerSetup from './pages/CareerSetup';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';
import FeedbackDetail from './pages/FeedbackDetail';
import History from './pages/History';
import CodingPractice from './pages/CodingPractice';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AdminPanel from './pages/AdminPanel';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Wrapper Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Layout pages */}
          <Route 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roadmap" element={<Dashboard />} /> {/* Roadmap is aggregated in Dashboard expander */}
            <Route path="/career-setup" element={<CareerSetup />} />
            <Route path="/interview" element={<InterviewRoom />} />
            <Route path="/code-practice" element={<CodingPractice />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/history" element={<History />} />
            <Route path="/report/:id" element={<FeedbackDetail />} />
            
            {/* Admin only paths */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
