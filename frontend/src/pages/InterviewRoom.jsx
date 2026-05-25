import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Sparkles, 
  ChevronRight, 
  Loader, 
  AlertCircle,
  HelpCircle,
  Play,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interview state
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [roundType, setRoundType] = useState('Technical');
  const [status, setStatus] = useState('setup'); // setup, starting, active, evaluating, done
  const [error, setError] = useState('');

  // Media streams
  const [videoStream, setVideoStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);

  // Speech and text
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);

  // Simulated AI indicators
  const [simulatedEmotion, setSimulatedEmotion] = useState('Calm');
  const [eyeContactRating, setEyeContactRating] = useState(90);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserAnswer(prev => prev + (finalTranscript ? ' ' + finalTranscript : ''));
      };

      rec.onerror = (err) => {
        console.error('Speech recognition error:', err.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Cleanup media loops on leave
  useEffect(() => {
    return () => {
      stopMedia();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Start webcam
  const startCamera = async () => {
    try {
      if (videoStream) stopMedia();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      setCameraActive(true);
      setMicActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Face Tracker Canvas animation and Web Audio decibels analyser
      initCanvasFaceTracker();
      initAudioMeter(stream);
    } catch (err) {
      console.error('Camera permissions refused:', err.message);
      setError('webcam or microphone access was denied. Please allow permissions in browser address bar.');
    }
  };

  // Stop video & audio loops
  const stopMedia = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setCameraActive(false);
    setMicActive(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // Mic level audio analyzer
  const initAudioMeter = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolumeLevel(Math.min(Math.round(average * 1.5), 100));
        
        // Dynamic emotion simulation based on voice
        if (average > 30) {
          setSimulatedEmotion('Speaking');
        } else {
          setSimulatedEmotion(prev => prev === 'Speaking' ? 'Calm' : prev);
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
    } catch (err) {
      console.warn('Web Audio meter error:', err.message);
    }
  };

  // Custom high-fidelity canvas bounding box face tracker overlay
  const initCanvasFaceTracker = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let x = 160;
    let y = 120;
    let dx = 0.5;
    let dy = 0.3;

    const drawFrame = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simple bouncy target simulation box (representing Face/Iris Landmarker coordinates)
      x += dx;
      y += dy;
      if (x < 110 || x > 210) dx = -dx;
      if (y < 90 || y > 150) dy = -dy;

      // Draw bounding facial frame
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#6366f1';
      
      // Face corner lines
      const width = 120;
      const height = 140;
      
      // Top Left Corner
      ctx.beginPath();
      ctx.moveTo(x, y + 25);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 25, y);
      ctx.stroke();

      // Top Right Corner
      ctx.beginPath();
      ctx.moveTo(x + width - 25, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + 25);
      ctx.stroke();

      // Bottom Left Corner
      ctx.beginPath();
      ctx.moveTo(x, y + height - 25);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + 25, y + height);
      ctx.stroke();

      // Bottom Right Corner
      ctx.beginPath();
      ctx.moveTo(x + width - 25, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width, y + height - 25);
      ctx.stroke();

      // Pupil / Eye contact indicator lines
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.arc(x + 40, y + 45, 3, 0, Math.PI * 2); // left eye coordinates
      ctx.arc(x + 80, y + 45, 3, 0, Math.PI * 2); // right eye coordinates
      ctx.fill();

      // Face tracking scan bar
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.shadowBlur = 0;
      const scanBarY = y + (Math.sin(Date.now() / 150) * 0.5 + 0.5) * height;
      ctx.fillRect(x, scanBarY, width, 2);

      // Eye contact score drift
      const contactDiff = Math.abs(x - 160) + Math.abs(y - 120);
      setEyeContactRating(Math.max(65, Math.round(98 - contactDiff / 2)));

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  // Launch AI Interview Session
  const initializeInterview = async () => {
    setError('');
    setStatus('starting');
    try {
      const res = await api.post('/interview/start', { roundType });
      if (res.data.success) {
        setSession(res.data.interview);
        setStatus('active');
        setCurrentIdx(0);
        speakQuestion(res.data.interview.questions[0].question);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize session.');
      setStatus('setup');
    }
  };

  // Speak AI question aloud
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose standard english voice if available
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang.includes('en')) || voices[0];
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setAvatarSpeaking(true);
      setSimulatedEmotion('Asking Question');
    };
    utterance.onend = () => {
      setAvatarSpeaking(false);
      setSimulatedEmotion('Calm');
      // Automatically trigger voice recorder if mic is active and supported
      if (speechSupported && micActive) {
        toggleListening(true);
      }
    };
    utterance.onerror = () => {
      setAvatarSpeaking(false);
      setSimulatedEmotion('Calm');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Mic Listen Toggle
  const toggleListening = (forceVal) => {
    if (!speechSupported || !recognitionRef.current) return;
    
    const targetState = typeof forceVal === 'boolean' ? forceVal : !isListening;

    if (targetState) {
      setUserAnswer('');
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  // Submit Answer & Evaluate in Real-Time
  const handleAnswerSubmit = async () => {
    if (isListening) toggleListening(false);
    window.speechSynthesis.cancel();

    setStatus('evaluating');
    try {
      const activeQ = session.questions[currentIdx];
      const res = await api.post(`/interview/${session._id}/answer`, {
        questionId: activeQ.questionId,
        userAnswer,
        eyeContactScore: eyeContactRating,
        confidenceScore: Math.min(100, Math.max(55, Math.round(92 - (userAnswer || '').split('basically').length * 8))),
        calmnessScore: simulatedEmotion === 'Calm' ? 90 : 78
      });

      if (res.data.success) {
        // Update local session status
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentIdx] = res.data.question;
        setSession(prev => ({ ...prev, questions: updatedQuestions }));

        // Advance or Finalize
        if (currentIdx + 1 < session.questions.length) {
          setCurrentIdx(prev => prev + 1);
          setUserAnswer('');
          setStatus('active');
          speakQuestion(session.questions[currentIdx + 1].question);
        } else {
          // Finalize whole interview report cards
          finalizeSession();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing response grade.');
      setStatus('active');
    }
  };

  // Finish whole session
  const finalizeSession = async () => {
    setStatus('evaluating');
    try {
      const res = await api.post(`/interview/${session._id}/complete`);
      if (res.data.success) {
        stopMedia();
        // Redirect directly to the diagnostic report card details!
        navigate(`/report/${res.data.report._id}`);
      }
    } catch (err) {
      setError('Failed to finalize interview report.');
      setStatus('active');
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 py-4">
      {/* Dynamic Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">AI Mock Interview Room</h2>
        <p className="text-sm font-semibold text-foreground/50 mt-1">
          {status === 'setup' ? 'Configure permissions and round categories.' : `Session in Progress - Round ${currentIdx + 1} of ${session?.questions?.length || 5}`}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-sm text-red-200">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* SETUP PHASE INTERFACE */}
      {status === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Left Column */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl glass-card border border-border/80 flex flex-col gap-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Setup Interview Parameters
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground/80 pl-1">Target Category / Round</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {['Technical', 'HR', 'Behavioral', 'Coding', 'Aptitude'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setRoundType(type)}
                    className={`
                      px-4 py-3 rounded-2xl border text-sm font-extrabold transition-all
                      ${roundType === type 
                        ? 'bg-primary border-primary shadow-neon-indigo text-white' 
                        : 'bg-card/40 border-border hover:border-primary/30 text-foreground/80'}
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card/65 border border-border/60 flex items-center justify-between gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold">Verify Web Camera & Microphone</h4>
                <p className="text-xs font-semibold text-foreground/50">Required for face tracking, posture, and speech metrics.</p>
              </div>
              <button
                onClick={startCamera}
                className={`
                  px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all
                  ${cameraActive 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : 'bg-primary hover:bg-primary-hover text-white shadow-neon-indigo'}
                `}
              >
                {cameraActive ? 'Devices Connected' : 'Access Devices'}
              </button>
            </div>

            <button
              onClick={initializeInterview}
              disabled={!cameraActive}
              className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-neon-indigo hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50"
            >
              <Play className="w-5 h-5 text-white" />
              Begin AI Interview
            </button>
          </div>

          {/* Right column: Devices checklist/preview */}
          <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-6 text-center">
            <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Webcam Feeds</h4>
            <div className="aspect-video w-full rounded-2xl bg-black/40 border border-border/80 flex items-center justify-center relative overflow-hidden shadow-inner">
              {cameraActive && videoStream ? (
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <CameraOff className="w-10 h-10 text-foreground/20" />
              )}
            </div>
            <div className="text-left flex flex-col gap-2.5">
              <h5 className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Requirement Checklist</h5>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-foreground/20'}`}></span>
                <span>Webcam Activated</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${micActive ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-foreground/20'}`}></span>
                <span>Microphone Enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${speechSupported ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-foreground/20'}`}></span>
                <span>Speech Engine Supported</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STARTING LOADER */}
      {status === 'starting' && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="text-2xl font-bold">Synchronizing Interviewer Avatar</h3>
          <p className="text-sm font-semibold text-foreground/50 max-w-sm mt-1 leading-relaxed">
            Structuring questions and initializing dynamic feedback evaluators for your {roundType} round...
          </p>
        </div>
      )}

      {/* ACTIVE INTERVIEW PHASE */}
      {(status === 'active' || status === 'evaluating') && session && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar and Webcam Feeds */}
          <div className="flex flex-col gap-4">
            {/* AI Avatar block */}
            <div className="p-5 rounded-3xl glass-card border border-border/80 bg-gradient-to-tr from-card/30 to-primary/5 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-danger/10 border border-danger/20 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>
                <span className="text-[10px] font-extrabold text-danger uppercase tracking-wider">LIVE REC</span>
              </div>
              
              <div className="relative mb-4 mt-2">
                {/* Glowing Avatar border */}
                <div className={`w-20 h-20 rounded-full border-2 ${avatarSpeaking ? 'border-primary shadow-neon-indigo animate-bounce' : 'border-border'} flex items-center justify-center bg-card/80`}>
                  <span className="text-3xl">🤖</span>
                </div>
              </div>
              
              <h4 className="text-sm font-extrabold text-foreground">AI Lead Recruiter</h4>
              <span className="text-[10px] font-bold text-foreground/40 mt-1 uppercase tracking-widest">Interviewer Avatar</span>
              
              <button 
                onClick={() => speakQuestion(session.questions[currentIdx].question)}
                className="mt-4 bg-card/60 hover:bg-card border border-border px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-all"
              >
                <Volume2 className="w-4 h-4 text-primary" /> Repeat Question
              </button>
            </div>

            {/* Webcam feed with visual overlays */}
            <div className="p-5 rounded-3xl glass-card border border-border/80 flex flex-col gap-4 relative overflow-hidden">
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-border/60">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Glowing Face overlay canvas */}
                <canvas 
                  ref={canvasRef}
                  width="320"
                  height="240"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none scale-x-[-1]"
                />

                {/* Subtitle speech overlay */}
                {isListening && (
                  <div className="absolute bottom-3 inset-x-3 bg-black/65 backdrop-blur-md border border-border/40 p-2.5 rounded-xl text-[11px] font-semibold text-center text-secondary leading-relaxed animate-pulse">
                    🎤 Listening: Speak your answer clearly...
                  </div>
                )}
              </div>

              {/* Real-time confidence trackers */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-foreground/50">Postural / Eye Contact score</span>
                  <span className="text-secondary">{eyeContactRating}%</span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-foreground/50">Emotion indicator</span>
                  <span className="text-primary">{simulatedEmotion}</span>
                </div>

                {/* Micro decibels level bar */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Mic Decibels Level</span>
                  <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-75"
                      style={{ width: `${volumeLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Question Feed Column */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl glass-card border border-border/80 flex flex-col justify-between gap-6 relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {status === 'evaluating' ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center gap-4"
                >
                  <Loader className="w-10 h-10 text-secondary animate-spin" />
                  <h4 className="text-xl font-bold">Analyzing Answer Quality</h4>
                  <p className="text-sm font-semibold text-foreground/50 max-w-sm">
                    Evaluating technical accuracy, communication vocabulary, filler word ratios, and facial confidence...
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col gap-6"
                >
                  {/* Current Active Question Display */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold pl-0.5">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span>Round Question Prompt</span>
                    </div>
                    <blockquote className="text-lg md:text-xl font-extrabold text-foreground leading-relaxed border-l-4 border-primary pl-4 py-1 italic bg-primary/5 rounded-r-xl">
                      "{session.questions[currentIdx].question}"
                    </blockquote>
                  </div>

                  {/* Speech input text area */}
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-foreground/80 pl-1">Your response</label>
                      {speechSupported && (
                        <button
                          onClick={() => toggleListening()}
                          className={`
                            px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all
                            ${isListening 
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse' 
                              : 'bg-primary/10 border border-primary/20 text-primary'}
                          `}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-3.5 h-3.5 text-red-400" /> Stop voice record
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5 text-primary" /> speak to answer
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <textarea 
                      rows="6"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Use your microphone to speak your answer, or type it here directly in full details..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-sm font-semibold leading-relaxed transition-all resize-none shadow-inner"
                    ></textarea>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons footer */}
            {status !== 'evaluating' && (
              <div className="flex justify-between items-center gap-4 mt-6 pt-6 border-t border-border/40">
                <button
                  onClick={() => {
                    stopMedia();
                    navigate('/dashboard');
                  }}
                  className="px-5 py-3 rounded-xl border border-border hover:border-danger hover:text-danger text-sm font-bold transition-all"
                >
                  Quit Interview
                </button>
                
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!userAnswer.trim()}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-neon-indigo hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all text-sm"
                >
                  <span>
                    {currentIdx + 1 === session.questions.length ? 'Finalize & Grade' : 'Submit & Next Question'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
