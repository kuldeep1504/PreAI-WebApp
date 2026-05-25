import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all details.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const res = await register(name, email, password);
    if (res && res.success) {
      navigate('/career-setup');
    } else {
      setError(res?.message || 'Registration failed. Try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/80 shadow-2xl relative"
      >
        <div className="text-center flex flex-col gap-2 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-sm font-semibold text-foreground/50">Join PrepAI to start professional coaching</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-sm text-red-200">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                <User className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                <Mail className="w-5 h-5" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                <Lock className="w-5 h-5" />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters" 
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-neon-indigo hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-semibold text-foreground/40">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
