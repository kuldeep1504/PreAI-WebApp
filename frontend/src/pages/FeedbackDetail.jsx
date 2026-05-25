import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Smile, 
  TrendingUp, 
  User, 
  MessageSquare,
  Flame,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // summary, dialogs

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/interview/report/${id}`);
        if (res.data.success) {
          setReport(res.data.report);
        }
      } catch (err) {
        console.error('Failed to load evaluation details:', err.message);
      }
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-8 glass-card border rounded-3xl max-w-md mx-auto my-12 flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-danger" />
        <h3 className="text-xl font-bold">Report Not Found</h3>
        <p className="text-sm font-semibold text-foreground/50">The requested mock evaluation report could not be located.</p>
        <Link to="/dashboard" className="bg-primary px-5 py-2.5 rounded-xl font-bold text-xs">Return to Onboarding</Link>
      </div>
    );
  }

  const { interview, overallScore, technicalScore, communicationScore, strengths, weaknesses, improvements, facialExpressionAnalysis } = report;

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header with back button and export actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/history" 
            className="p-2.5 rounded-xl bg-card/65 border border-border hover:border-primary/40 text-foreground/80 hover:text-primary transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">AI Diagnostic Report</h2>
            <p className="text-sm font-semibold text-foreground/50 mt-1">
              Feedback for <span className="text-primary font-bold">{interview?.targetRole}</span> mock round at <span className="text-secondary font-bold">{interview?.targetCompany}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="bg-card hover:bg-card/85 border border-border px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all self-stretch md:self-auto text-center justify-center"
        >
          <Download className="w-4 h-4 text-foreground/75" /> Export PDF Report
        </button>
      </div>

      {/* Metric aggregate headers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score Circle Progress */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex flex-col items-center text-center justify-center gap-3 bg-gradient-to-tr from-card/30 to-primary/5">
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Recruiter Score</span>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95">
              <circle cx="40" cy="40" r="34" className="stroke-border/40 fill-none" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" className="stroke-primary fill-none" strokeWidth="6" strokeDasharray={213} strokeDashoffset={213 - (213 * overallScore) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xl font-black">{overallScore}%</span>
          </div>
        </div>

        {/* Technical Score */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex flex-col items-center text-center justify-center gap-3">
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Tech Accuracy</span>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95">
              <circle cx="40" cy="40" r="34" className="stroke-border/40 fill-none" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" className="stroke-accent fill-none" strokeWidth="6" strokeDasharray={213} strokeDashoffset={213 - (213 * technicalScore) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xl font-black text-accent">{technicalScore}%</span>
          </div>
        </div>

        {/* Communication Score */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex flex-col items-center text-center justify-center gap-3">
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Speaking Fluency</span>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95">
              <circle cx="40" cy="40" r="34" className="stroke-border/40 fill-none" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" className="stroke-secondary fill-none" strokeWidth="6" strokeDasharray={213} strokeDashoffset={213 - (213 * communicationScore) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xl font-black text-secondary">{communicationScore}%</span>
          </div>
        </div>

        {/* Postural Bounding checks */}
        <div className="p-5 rounded-3xl glass-card border border-border/80 flex flex-col items-center text-center justify-center gap-3">
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Eye Contact Ratio</span>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95">
              <circle cx="40" cy="40" r="34" className="stroke-border/40 fill-none" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" className="stroke-green-500 fill-none" strokeWidth="6" strokeDasharray={213} strokeDashoffset={213 - (213 * (facialExpressionAnalysis?.eyeContactScore || 85)) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xl font-black text-green-400">{(facialExpressionAnalysis?.eyeContactScore || 85)}%</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu toggling between summary analysis and question timeline */}
      <div className="flex border-b border-border/60 gap-4 mt-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-foreground'}`}
        >
          Diagnostic Summary
        </button>
        <button
          onClick={() => setActiveTab('dialogs')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${activeTab === 'dialogs' ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-foreground'}`}
        >
          Question-by-Question Dialogue
        </button>
      </div>

      {/* TAB CONTENT: DIAGNOSTIC SUMMARY */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths & Weaknesses */}
          <div className="flex flex-col gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5 text-green-400" /> Key Strengths
              </h3>
              <ul className="flex flex-col gap-3 pl-1">
                {strengths.map((str, idx) => (
                  <li key={idx} className="text-sm font-semibold text-foreground/80 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0 mt-2 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-danger">
                <XCircle className="w-5 h-5 text-danger" /> Areas of Vulnerability
              </h3>
              <ul className="flex flex-col gap-3 pl-1">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-sm font-semibold text-foreground/80 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-danger shrink-0 mt-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action items roadmap */}
          <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-5 bg-gradient-to-br from-card/30 to-secondary/5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-secondary">
              <TrendingUp className="w-5 h-5 text-secondary animate-bounce" /> Constructive Action Roadmap
            </h3>
            
            <div className="flex flex-col gap-4 pl-1">
              {improvements.map((imp, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary text-xs font-black shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">Milestone Action</h4>
                    <p className="text-xs font-medium text-foreground/60 leading-relaxed mt-1">{imp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Prepare Next Round</span>
                  <span className="text-[10px] text-foreground/40 font-semibold">Keep up your daily streak!</span>
                </div>
              </div>
              <Link to="/interview" className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-neon-indigo transition-all">
                Retry Round
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DIALOG timeline */}
      {activeTab === 'dialogs' && (
        <div className="flex flex-col gap-6">
          {interview?.questions.map((qObj, idx) => (
            <div 
              key={qObj.questionId}
              className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Question Index Badge */}
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-xs font-black text-primary uppercase tracking-widest">Question {idx + 1}</span>
                {qObj.evaluation && (
                  <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                    Technical Grade: {qObj.evaluation.technicalAccuracy}%
                  </span>
                )}
              </div>

              {/* Question wording */}
              <div className="flex gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Interviewer Prompt</h4>
                  <blockquote className="text-sm font-extrabold text-foreground mt-1 leading-relaxed">
                    "{qObj.question}"
                  </blockquote>
                </div>
              </div>

              {/* User transcript */}
              <div className="flex gap-2 bg-card/40 p-4 rounded-2xl border border-border/40 mt-1">
                <span className="text-xl">🗣️</span>
                <div className="w-full">
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Your Transcript Response</h4>
                  <p className="text-sm font-semibold text-foreground/80 mt-1.5 leading-relaxed">
                    {qObj.userAnswer ? `"${qObj.userAnswer}"` : <span className="text-foreground/30 italic">No verbal response recorded.</span>}
                  </p>
                  
                  {/* Speech grammar checks */}
                  {qObj.evaluation?.fillerWordsDetected && qObj.evaluation.fillerWordsDetected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-3.5 border-t border-border/30">
                      <span className="text-[10px] font-bold text-danger uppercase tracking-widest pr-1">Detected Fillers:</span>
                      {qObj.evaluation.fillerWordsDetected.map((filler, fIdx) => (
                        <span key={fIdx} className="text-[10px] font-extrabold bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-lg">
                          {filler}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recruiter Suggested ideal answer */}
              {qObj.evaluation?.suggestedAnswer && (
                <div className="flex gap-2 p-4 rounded-2xl bg-secondary/5 border border-secondary/10 mt-1">
                  <span className="text-xl">💡</span>
                  <div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Recruiter Model Template</h4>
                    <p className="text-sm font-semibold text-foreground/80 mt-1.5 leading-relaxed">
                      {qObj.evaluation.suggestedAnswer}
                    </p>
                  </div>
                </div>
              )}

              {/* Diagnostic dialogue notes */}
              {qObj.evaluation?.generalFeedback && (
                <div className="flex gap-2 mt-2 pl-1 items-start">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-xs font-semibold text-foreground/50 leading-relaxed">
                    <span className="text-primary font-bold">Recruiter Diagnostic:</span> {qObj.evaluation.generalFeedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackDetail;
