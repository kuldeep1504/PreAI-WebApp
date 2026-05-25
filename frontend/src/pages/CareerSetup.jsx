import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, Award, Code, BrainCircuit, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const CareerSetup = () => {
  const { updateProfile, triggerRoadmap } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState(0);
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [language, setLanguage] = useState('JavaScript');
  const [weakAreas, setWeakAreas] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAnalyzing(true);

    if (!role || !company) {
      setError('Please add your target role and company.');
      setIsAnalyzing(false);
      return;
    }

    // Save profile data
    const profileRes = await updateProfile({
      targetRole: role,
      targetCompany: company,
      experience: Number(experience),
      skillLevel,
      preferredLanguage: language,
      weakAreas
    });

    if (profileRes.success) {
      // Trigger Gemini AI Roadmap Generation
      const roadmapRes = await triggerRoadmap();
      if (roadmapRes.success) {
        navigate('/dashboard');
      } else {
        setError(roadmapRes.message || 'Failed to generate AI roadmap, but profile saved.');
      }
    } else {
      setError(profileRes.message || 'Profile saving failed.');
    }
    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
          <Sparkles className="w-8 h-8 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <motion.h3 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-bold mb-3"
        >
          Analyzing Goals & Synthesizing Roadmap
        </motion.h3>
        <p className="text-sm font-semibold text-foreground/50 max-w-md leading-relaxed">
          Gemini is analyzing technical benchmarks for <span className="text-primary font-bold">{role}</span> at <span className="text-secondary font-bold">{company}</span> to compile structured topic grids, daily challenges, and custom interview prompts...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex flex-col gap-2 mb-8 text-center md:text-left">
        <div className="flex items-center gap-2 text-primary font-bold justify-center md:justify-start">
          <BrainCircuit className="w-6 h-6 animate-pulse" />
          <span>AI Career Analyst</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">Configure Target Profile</h2>
        <p className="text-sm font-semibold text-foreground/50">Our system calibrates mock challenges, ATS resumes, and roadmap milestones around these entries.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl text-sm font-semibold text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl glass-card border border-border/80 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-primary" /> Target Role
            </label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer, Full-Stack Developer" 
              className="w-full px-4 py-3 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-secondary" /> Target Company
            </label>
            <input 
              type="text" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, Microsoft" 
              className="w-full px-4 py-3 rounded-2xl bg-card/60 border border-border focus:border-secondary focus:outline-none text-sm font-medium transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Years of Experience
            </label>
            <input 
              type="number" 
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 2" 
              className="w-full px-4 py-3 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground/80 pl-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-secondary" /> Current Skill Level
            </label>
            <select 
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-card/60 border border-border focus:border-secondary focus:outline-none text-sm font-medium transition-all appearance-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-foreground/80 pl-1 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-primary" /> Preferred Language / Stack
          </label>
          <input 
            type="text" 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. JavaScript, Python, Java, C++" 
            className="w-full px-4 py-3 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-foreground/80 pl-1">Weak / Focus Areas</label>
          <textarea 
            rows="3"
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
            placeholder="e.g. Dynamic Programming, System Design, STAR behavioral questions" 
            className="w-full px-4 py-3 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-medium transition-all resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-neon-indigo hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 transition-all text-sm mt-4"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          Generate Personalized Roadmap
        </button>
      </form>
    </div>
  );
};

export default CareerSetup;
