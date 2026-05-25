import React, { useState } from 'react';
import api from '../utils/api';
import { 
  FileCheck, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader, 
  AlertCircle,
  FileText,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [method, setMethod] = useState('upload'); // upload, paste

  // Analysis outcomes
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Only PDF resumes are supported.');
        return;
      }
      setFile(selected);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEvaluation(null);
    setIsLoading(true);

    const formData = new FormData();

    if (method === 'upload') {
      if (!file) {
        setError('Please select a PDF resume file.');
        setIsLoading(false);
        return;
      }
      formData.append('resume', file);
    } else {
      if (!resumeText.trim()) {
        setError('Please paste your resume text.');
        setIsLoading(false);
        return;
      }
      formData.append('resumeText', resumeText);
    }

    try {
      // Trigger API endpoint
      const res = await api.post('/ai/resume-analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setEvaluation(res.data.evaluation);
      }
    } catch (err) {
      console.error('Failed to analyze resume:', err.message);
      setError(err.response?.data?.message || 'Server error analyzing resume.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">AI ATS Resume Analyzer</h2>
        <p className="text-sm font-semibold text-foreground/50 mt-1">
          Upload your resume to receive structural grading, missing keyword optimization, and custom target company alignment tips.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-sm text-red-200">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Upload fields */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-6 bg-gradient-to-b from-card/30 to-background/50 flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" /> Onboard Profile Resume
            </h3>

            {/* Toggle method selector */}
            <div className="flex bg-card/60 p-1.5 rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setMethod('upload');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${method === 'upload' ? 'bg-primary text-white shadow-neon-indigo' : 'text-foreground/50 hover:text-foreground'}`}
              >
                Upload PDF Resume
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('paste');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${method === 'paste' ? 'bg-primary text-white shadow-neon-indigo' : 'text-foreground/50 hover:text-foreground'}`}
              >
                Copy & Paste Text
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex-1 flex flex-col gap-5 justify-between">
              {method === 'upload' ? (
                /* PDF File upload drag portal */
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/45 rounded-2xl p-8 text-center gap-3 transition-colors bg-card/10 cursor-pointer relative min-h-[220px]">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-primary animate-pulse" />
                      <span className="text-sm font-extrabold text-foreground truncate max-w-[260px]">{file.name}</span>
                      <span className="text-[10px] text-foreground/40 font-semibold">{(file.size / 1024).toFixed(1)} KB - Ready for analysis</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-foreground/30" />
                      <span className="text-sm font-bold text-foreground">Click to browse your files</span>
                      <span className="text-xs text-foreground/45">Supports only .pdf files up to 5MB</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Plain text area */
                <textarea
                  rows="10"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste the raw text of your resume here in full detail (work experience, education, skills, projects)..."
                  className="w-full flex-1 p-4 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-xs font-semibold leading-relaxed transition-all resize-none shadow-inner"
                  required
                ></textarea>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-neon-indigo hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Running ATS grading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                    Calculate ATS Match Score
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Evaluation details */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 rounded-3xl glass-card border border-border/80 flex-1 flex flex-col items-center justify-center text-center gap-4 min-h-[350px]"
              >
                <Loader className="w-12 h-12 text-primary animate-spin" />
                <h4 className="text-xl font-bold">Scanning Resume Index & Keywords</h4>
                <p className="text-sm font-semibold text-foreground/50 max-w-sm">
                  Benchmarking content structure, layout quality, matched tags, and parsing skills against target company criteria...
                </p>
              </motion.div>
            ) : evaluation ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-8 rounded-3xl glass-card border border-border/80 flex flex-col gap-6"
              >
                {/* Score section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border/60 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <FileCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Recruiter ATS Grade Card</h3>
                      <span className="text-xs font-semibold text-foreground/50">Audit complete</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center md:text-right">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block">ATS Match</span>
                      <span className="text-2xl font-black text-secondary">{evaluation.atsScore}%</span>
                    </div>
                    <div className="text-center md:text-right border-l border-border/60 pl-4">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block">Formatting</span>
                      <span className="text-2xl font-black text-primary">{evaluation.formattingScore}%</span>
                    </div>
                  </div>
                </div>

                {/* matched skills and missing skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
                  {/* Matched skills */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-green-400 flex items-center gap-1.5 pl-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Matched Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.matchedSkills && evaluation.matchedSkills.length > 0 ? (
                        evaluation.matchedSkills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-xl">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-semibold text-foreground/35 italic">None matched yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-danger flex items-center gap-1.5 pl-0.5">
                      <XCircle className="w-4 h-4 text-danger" /> Missing Vital Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.missingSkills && evaluation.missingSkills.length > 0 ? (
                        evaluation.missingSkills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-bold bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded-xl">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-semibold text-green-400 italic">Resume meets all required skill parameters.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Suggestions list */}
                <div className="flex flex-col gap-3 mt-2 pl-0.5 border-t border-border/40 pt-5">
                  <h4 className="text-xs font-bold text-foreground/50 uppercase tracking-widest flex items-center gap-1">
                    <Bookmark className="w-4 h-4 text-primary" /> Key improvement bullet items
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {evaluation.suggestions && evaluation.suggestions.map((s, idx) => (
                      <li key={idx} className="text-xs font-semibold text-foreground/80 flex items-start gap-2.5 leading-relaxed">
                        <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* recruiter overview text */}
                {evaluation.atsFeedback && (
                  <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 mt-2 flex gap-3">
                    <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-extrabold text-secondary uppercase tracking-widest">Recruiter Audit Verdict</h4>
                      <p className="text-xs font-medium text-foreground/75 leading-relaxed mt-1">{evaluation.atsFeedback}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="border border-border/80 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center gap-3 min-h-[350px]">
                <FileText className="w-12 h-12 text-foreground/20" />
                <h3 className="text-lg font-bold">Awaiting Resume Inputs</h3>
                <p className="text-sm font-semibold text-foreground/50 max-w-sm leading-relaxed">
                  Provide your PDF resume or copy-paste the text content, and trigger the ATS analyzer to audit matching metrics.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
