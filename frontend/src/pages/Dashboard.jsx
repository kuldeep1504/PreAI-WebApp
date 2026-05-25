import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Trophy, 
  Speech, 
  Cpu, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  ChevronRight,
  BookOpen,
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/ai/dashboard');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err.message);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
      </div>
    );
  }

  // Fallback default state in case API has issues or hasn't loaded
  const stats = analytics || {
    totalInterviews: 0,
    averageScore: 0,
    averageCommunication: 0,
    averageTechnical: 0,
    confidenceLevel: 'Medium',
    streak: user?.streak || 0,
    progressChart: [
      { name: 'Day 1', overall: 40, technical: 35, communication: 45 },
      { name: 'Day 2', overall: 48, technical: 40, communication: 55 },
      { name: 'Day 3', overall: 55, technical: 52, communication: 58 },
      { name: 'Day 4', overall: 65, technical: 60, communication: 70 },
      { name: 'Day 5', overall: 72, technical: 65, communication: 78 },
      { name: 'Day 6', overall: 80, technical: 75, communication: 85 },
    ],
    strengths: ["Motivation established", "Core profile configured"],
    weaknesses: ["No mock sessions conducted yet"],
    aiInsight: "Complete your first live AI technical or HR interview session to unlock detailed performance analytics.",
    profileComplete: !!(user?.profile?.targetRole && user?.profile?.targetCompany)
  };

  const roadmap = user?.profile?.roadmap;

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Onboarding Hub</h2>
          <p className="text-sm font-semibold text-foreground/50 mt-1">
            Tracking prep for <span className="text-primary font-bold">{user?.profile?.targetRole || 'Developer'}</span> at <span className="text-secondary font-bold">{user?.profile?.targetCompany || 'Top Tech'}</span>
          </p>
        </div>
        <Link 
          to="/interview"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-neon-indigo hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 transition-all text-sm self-stretch md:self-auto text-center justify-center"
        >
          <PlayCircle className="w-5 h-5 text-white" />
          Start Mock Session
        </Link>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Interviews Attended</span>
            <span className="text-2xl md:text-3xl font-black">{stats.totalInterviews}</span>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Average Score</span>
            <span className="text-2xl md:text-3xl font-black text-secondary">{stats.averageScore}%</span>
          </div>
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Communication Score */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Communication</span>
            <span className="text-2xl md:text-3xl font-black text-green-400">{stats.averageCommunication}%</span>
          </div>
          <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
            <Speech className="w-5 h-5" />
          </div>
        </div>

        {/* Technical Score */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Technical Score</span>
            <span className="text-2xl md:text-3xl font-black text-accent">{stats.averageTechnical}%</span>
          </div>
          <div className="p-3 bg-accent/10 rounded-2xl text-accent">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Chart and AI suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Preparation Progress</h3>
            <span className="text-xs font-semibold text-foreground/50 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-secondary" /> Performance trends
            </span>
          </div>
          
          <div className="w-full h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.progressChart}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250, 89%, 65%)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(250, 89%, 65%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(280, 85%, 60%)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(280, 85%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 7%)', 
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="overall" name="Overall" stroke="hsl(250, 89%, 65%)" strokeWidth={2} fillOpacity={1} fill="url(#colorOverall)" />
                <Area type="monotone" dataKey="technical" name="Technical" stroke="hsl(280, 85%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorTech)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI suggestions Column */}
        <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col justify-between gap-6 relative overflow-hidden bg-gradient-to-tr from-card/30 to-primary/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full filter blur-xl"></div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span>AI Coaching Insight</span>
            </div>
            
            <p className="text-sm font-semibold text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: stats.aiInsight }}></p>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
            <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Active Development Indicators</h4>
            <div className="flex flex-wrap gap-2">
              {stats.strengths.slice(0, 2).map((s, idx) => (
                <span key={idx} className="text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-xl">
                  {s}
                </span>
              ))}
              {stats.weaknesses.slice(0, 2).map((w, idx) => (
                <span key={idx} className="text-xs font-bold bg-danger/10 text-danger border border-danger/20 px-2.5 py-1 rounded-xl">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Generated 7-day Roadmap visual planner */}
      {roadmap ? (
        <div className="p-6 md:p-8 rounded-3xl glass-card border border-border/80 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/50 pb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              <h3 className="text-xl font-bold">Personalized Preparation Calendar</h3>
            </div>
            <span className="text-xs font-semibold text-foreground/50">
              Generated by Gemini Recruiter for {roadmap.targetRole}
            </span>
          </div>

          {/* Calendar Day Grid Selector */}
          <div className="grid grid-cols-7 gap-2">
            {roadmap.days.map((dayObj) => (
              <button
                key={dayObj.day}
                onClick={() => setActiveDay(dayObj.day)}
                className={`
                  p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all
                  ${activeDay === dayObj.day 
                    ? 'bg-primary border-primary shadow-neon-indigo text-white font-extrabold scale-105' 
                    : 'glass-card border-border hover:border-primary/40 font-bold text-foreground/75'}
                `}
              >
                <span className="text-[10px] uppercase opacity-60 tracking-wider">Day</span>
                <span className="text-base md:text-lg">{dayObj.day}</span>
              </button>
            ))}
          </div>

          {/* Detail card of Active Selected Day */}
          {roadmap.days.find(d => d.day === activeDay) && (
            <motion.div 
              key={activeDay}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-card/65 border border-border/50 flex flex-col gap-4 mt-2"
            >
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Milestones</span>
                <h4 className="text-lg font-extrabold mt-1 text-foreground">
                  {roadmap.days.find(d => d.day === activeDay).title}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Topics Column */}
                <div className="flex flex-col gap-3">
                  <h5 className="text-xs font-bold text-foreground/50 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" /> Key Study Topics
                  </h5>
                  <ul className="flex flex-col gap-2 pl-1.5">
                    {roadmap.days.find(d => d.day === activeDay).topics.map((t, idx) => (
                      <li key={idx} className="text-sm font-semibold text-foreground/80 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Question Practice Column */}
                <div className="flex flex-col gap-3">
                  <h5 className="text-xs font-bold text-foreground/50 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-secondary" /> Daily Practice Prompts
                  </h5>
                  <ul className="flex flex-col gap-2 pl-1.5">
                    {roadmap.days.find(d => d.day === activeDay).practiceQuestions.map((q, idx) => (
                      <li key={idx} className="text-sm font-semibold text-foreground/80 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Study resources bottom box */}
              {roadmap.days.find(d => d.day === activeDay).studyResources && (
                <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-foreground/40">Suggested Assets:</span>
                  {roadmap.days.find(d => d.day === activeDay).studyResources.map((res, idx) => (
                    <span key={idx} className="text-xs font-bold bg-card px-2.5 py-1 rounded-lg border border-border/80 text-foreground/70">
                      {res}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Company recruiting patterns summary box */}
          {roadmap.companyPattern && (
            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-start gap-3 mt-2">
              <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h5 className="text-xs font-bold text-secondary uppercase tracking-widest">Recruiting Blueprint for {roadmap.targetCompany}</h5>
                <p className="text-sm font-semibold text-foreground/75 leading-relaxed mt-1">{roadmap.companyPattern}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl glass-card border border-border/80 text-center flex flex-col items-center gap-4">
          <Calendar className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-bold">Roadmap Awaiting AI Setup</h3>
          <p className="text-sm font-semibold text-foreground/50 max-w-md">
            Complete your onboarding goals setup to generate your custom multi-day prep schedule.
          </p>
          <Link to="/career-setup" className="bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl font-bold text-sm shadow-neon-indigo transition-all">
            Setup Goals Wizard
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
