import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Video, 
  Speech, 
  Code2, 
  FileCheck, 
  Activity, 
  Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "AI-Powered Mock Interviews",
      desc: "Simulate rigorous technical and HR rounds. The AI behaves like a real lead interviewer, adapting difficulty on the fly.",
      icon: Video,
      color: "text-primary shadow-neon-indigo"
    },
    {
      title: "Real-Time Speech Rater",
      desc: "Analyze filler words, fluency, pacing, volume, and confidence scores. Connect directly via voice for natural communication.",
      icon: Speech,
      color: "text-secondary shadow-neon-cyan"
    },
    {
      title: "Coding Practice Sandbox",
      desc: "Solve DSA challenges in JavaScript or Python with comprehensive real-time AI code reviews and complexity optimization.",
      icon: Code2,
      color: "text-accent shadow-[0_0_15px_rgba(217,70,239,0.35)]"
    },
    {
      title: "ATS Resume Grading",
      desc: "Upload your resume to receive structural grading, missing keyword optimization, and custom target company alignment tips.",
      icon: FileCheck,
      color: "text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.35)]"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] relative overflow-hidden py-12">
      {/* Background aesthetic blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[120px] -z-10 animate-pulse-glow"></div>
      
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-6 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-primary/20 text-sm font-semibold text-primary shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]"
        >
          <Sparkles className="w-4 h-4 text-primary animate-spin" />
          <span>Next-Generation MERN & Gemini AI Platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
        >
          Ace Your Next Interview with <br />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
            Intelligent AI Simulations
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl font-medium text-foreground/60 max-w-2xl leading-relaxed"
        >
          PrepAI is an immersive, all-in-one preparation suite that generates personalized roadmaps, tracks speech metrics, evaluates code syntax, and conducts adaptive voice-driven mock interviews.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          {user ? (
            <Link 
              to="/dashboard" 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-neon-indigo hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transform hover:-translate-y-0.5 transition-all text-base"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-neon-indigo hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transform hover:-translate-y-0.5 transition-all text-base"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="glass-card hover:bg-card/60 border-border hover:border-primary/30 px-8 py-4 rounded-2xl font-bold transition-all text-base"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-4 mt-24">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div 
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl glass-card glass-card-hover flex flex-col gap-4 relative overflow-hidden"
            >
              <div className={`p-3 rounded-2xl bg-card/65 inline-block w-fit ${feat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{feat.title}</h3>
              <p className="text-sm font-semibold text-foreground/50 leading-relaxed">{feat.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Trust & Metric Section */}
      <div className="mt-24 p-8 rounded-3xl glass-card border border-border/80 text-center max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-around gap-8">
        <div>
          <h4 className="text-3xl font-extrabold text-primary">94%</h4>
          <p className="text-xs font-bold text-foreground/40 mt-1 uppercase tracking-widest">Confidence Improvement</p>
        </div>
        <div className="hidden md:block w-px bg-border/60 h-12"></div>
        <div>
          <h4 className="text-3xl font-extrabold text-secondary">50,000+</h4>
          <p className="text-xs font-bold text-foreground/40 mt-1 uppercase tracking-widest">Mock Questions Answered</p>
        </div>
        <div className="hidden md:block w-px bg-border/60 h-12"></div>
        <div>
          <h4 className="text-3xl font-extrabold text-accent">85%</h4>
          <p className="text-xs font-bold text-foreground/40 mt-1 uppercase tracking-widest">ATS Match Success</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
