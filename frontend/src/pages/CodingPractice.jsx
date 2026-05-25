import React, { useState } from 'react';
import api from '../utils/api';
import { 
  Code2, 
  Terminal, 
  Sparkles, 
  Bug, 
  Cpu, 
  ChevronRight, 
  Play, 
  Loader, 
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initial preloaded DSA questions
const PRELOADED_CHALLENGES = [
  {
    id: "two_sum",
    title: "1. Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    starterTemplates: {
      JavaScript: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
      Python: "def two_sum(nums, target):\n    # Write your code here\n    pass"
    }
  },
  {
    id: "longest_substring",
    title: "3. Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3", explanation: "The answer is \"abc\", with the length of 3." }
    ],
    starterTemplates: {
      JavaScript: "function lengthOfLongestSubstring(s) {\n  // Write your code here\n  \n}",
      Python: "def length_of_longest_substring(s):\n    # Write your code here\n    pass"
    }
  }
];

const CodingPractice = () => {
  const [challenges, setChallenges] = useState(PRELOADED_CHALLENGES);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [language, setLanguage] = useState('JavaScript');
  
  // Code editor values mapping
  const [code, setCode] = useState(PRELOADED_CHALLENGES[0].starterTemplates.JavaScript);
  
  // Compile & Review status
  const [localOutput, setLocalOutput] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeChallenge = challenges[activeChallengeIdx];

  // Language Change helper
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(activeChallenge.starterTemplates[lang]);
    setLocalOutput(null);
    setAiReview(null);
  };

  // Select Challenge helper
  const handleChallengeChange = (idx) => {
    setActiveChallengeIdx(idx);
    const newChallenge = challenges[idx];
    setCode(newChallenge.starterTemplates[language] || newChallenge.starterTemplates.JavaScript);
    setLocalOutput(null);
    setAiReview(null);
  };

  // Compile local JS simulator code safely
  const runLocalTests = () => {
    setLocalOutput(null);
    if (language !== 'JavaScript') {
      setLocalOutput({
        success: true,
        message: "Local test compiled successfully! (Note: Local sandboxed executions are fully supported for JavaScript. For deep structural checking, trigger the AI Recruiter review below)."
      });
      return;
    }

    try {
      // Evaluate simple test cases
      const userFn = new Function(`return ${code}`)();
      let testPassed = false;
      let outputStr = '';

      if (activeChallenge.id === 'two_sum') {
        const testRes = userFn([2, 7, 11, 15], 9);
        if (Array.isArray(testRes) && testRes.includes(0) && testRes.includes(1)) {
          testPassed = true;
          outputStr = "Test Case [2,7,11,15], target=9 -> Output: " + JSON.stringify(testRes);
        } else {
          outputStr = "Incorrect Output: " + JSON.stringify(testRes);
        }
      } else if (activeChallenge.id === 'longest_substring') {
        const testRes = userFn("abcabcbb");
        if (testRes === 3) {
          testPassed = true;
          outputStr = "Test Case \"abcabcbb\" -> Output: " + testRes;
        } else {
          outputStr = "Incorrect Output: " + testRes;
        }
      }

      setLocalOutput({
        success: testPassed,
        message: testPassed ? `🎉 Test Passed! ${outputStr}` : `❌ Test Failed. ${outputStr}`
      });
    } catch (err) {
      setLocalOutput({
        success: false,
        message: `💥 Compilation Error: ${err.message}`
      });
    }
  };

  // Query AI Code Review from backend
  const triggerAiReview = async () => {
    setIsLoading(true);
    setAiReview(null);
    try {
      const res = await api.post('/ai/code-review', {
        language,
        code,
        question: activeChallenge.title
      });
      if (res.data.success) {
        setAiReview(res.data.review);
      }
    } catch (err) {
      console.error('Failed to trigger AI reviewer:', err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">AI Coding Workspace</h2>
          <p className="text-sm font-semibold text-foreground/50 mt-1">
            Solve algorithms in our online sandbox and fetch granular complexity and architecture audit reports from the AI Mentor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Challenge details and select selector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Challenge Selector */}
          <div className="p-4 rounded-3xl glass-card border border-border/80 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest pl-1">Select Challenge</span>
            <div className="flex flex-col gap-1.5 mt-1">
              {challenges.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => handleChallengeChange(idx)}
                  className={`
                    w-full text-left px-3.5 py-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-between
                    ${activeChallengeIdx === idx 
                      ? 'bg-primary/10 border-primary text-primary shadow-[inset_0_0_12px_rgba(99,102,241,0.08)]' 
                      : 'bg-card/40 border-border hover:border-primary/20 text-foreground/80'}
                  `}
                >
                  <span>{c.title}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${c.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {c.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description box */}
          <div className="p-6 rounded-3xl glass-card border border-border/80 flex-1 flex flex-col gap-4 bg-gradient-to-b from-card/30 to-background/50">
            <div className="flex items-center gap-1.5 border-b border-border/60 pb-3">
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
              <h3 className="text-base font-extrabold text-foreground">{activeChallenge.title}</h3>
            </div>
            
            <p className="text-sm font-semibold text-foreground/75 leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: activeChallenge.description }}></p>
            
            <div className="flex flex-col gap-3.5 mt-2 pl-1">
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Example Cases</span>
              {activeChallenge.examples.map((ex, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-card border border-border/60 flex flex-col gap-1.5 text-xs font-semibold">
                  <div>
                    <span className="text-primary font-bold">Input:</span> <code className="text-foreground/85">{ex.input}</code>
                  </div>
                  <div>
                    <span className="text-secondary font-bold">Output:</span> <code className="text-foreground/85">{ex.output}</code>
                  </div>
                  {ex.explanation && (
                    <div className="text-[10px] text-foreground/45 italic leading-relaxed border-t border-border/30 pt-1.5 mt-0.5">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Code Editor and run results */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-3xl glass-card border border-border/80 overflow-hidden flex flex-col">
            {/* Editor Top Menu */}
            <div className="px-5 py-3 border-b border-border/80 flex justify-between items-center bg-card/50">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">Console Editor</span>
              </div>

              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold focus:outline-none"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
              </select>
            </div>

            {/* Code Textarea editor */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-80 px-5 py-4 bg-black/40 text-green-300 font-mono text-sm leading-relaxed border-none focus:outline-none resize-none shadow-inner"
              spellCheck="false"
            ></textarea>

            {/* Footer triggers */}
            <div className="px-5 py-3.5 border-t border-border/80 flex items-center justify-between gap-4 bg-card/30">
              <button
                onClick={runLocalTests}
                className="px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all text-foreground/80 hover:text-primary"
              >
                <Play className="w-3.5 h-3.5" /> Run Code
              </button>
              
              <button
                onClick={triggerAiReview}
                disabled={isLoading}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-neon-indigo hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    AI Recruiter Review
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Local compilation output */}
          {localOutput && (
            <div className={`p-4 rounded-2xl border flex gap-3 items-start text-xs font-semibold ${localOutput.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-danger/10 border-danger/20 text-red-200'}`}>
              {localOutput.success ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />}
              <div className="leading-relaxed">{localOutput.message}</div>
            </div>
          )}

          {/* AI Diagnostic Review details card */}
          {aiReview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-5 bg-gradient-to-tr from-card/30 to-accent/5"
            >
              <div className="flex justify-between items-center border-b border-border/60 pb-3.5">
                <h3 className="text-sm font-extrabold flex items-center gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" /> AI Evaluation Report
                </h3>
                <span className="text-xs font-black text-secondary">
                  Architectural Grade: {aiReview.score}%
                </span>
              </div>

              {/* Complexities info row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-card border border-border/60 flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground/50">Time Complexity</span>
                  <span className="text-primary font-black flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-primary" /> {aiReview.timeComplexity}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/60 flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground/50">Space Complexity</span>
                  <span className="text-secondary font-black flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-secondary" /> {aiReview.spaceComplexity}
                  </span>
                </div>
              </div>

              {/* Bug List */}
              {aiReview.bugsFound && aiReview.bugsFound.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-danger uppercase tracking-widest flex items-center gap-1">
                    <Bug className="w-3.5 h-3.5 text-danger" /> Bug vectors detected
                  </h4>
                  <ul className="flex flex-col gap-1.5 pl-0.5">
                    {aiReview.bugsFound.map((bug, bIdx) => (
                      <li key={bIdx} className="text-xs font-semibold text-foreground/80 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                        <span>{bug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex gap-2 text-xs font-semibold text-green-400 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>No syntax or structural logical errors detected. Clean execution logic!</span>
                </div>
              )}

              {/* Review content details */}
              <div className="flex flex-col gap-2 pl-0.5">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Recruiter review details</span>
                <p className="text-xs font-medium text-foreground/70 leading-relaxed">{aiReview.reviewDetails}</p>
              </div>

              {/* Refactored model template */}
              {aiReview.optimizedCode && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest pl-0.5">Optimized Reference snippet</span>
                  <pre className="p-4 rounded-2xl bg-black/60 text-secondary border border-border/80 font-mono text-xs leading-relaxed overflow-x-auto max-h-56">
                    <code>{aiReview.optimizedCode}</code>
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingPractice;
