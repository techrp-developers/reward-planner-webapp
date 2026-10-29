// src/modules/games/QuizGamePage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';
import {
  fetchQuizLeaderboard,
  startQuizSession,
  answerQuizQuestion,
  nextQuizQuestion,
  QuizSessionData,
  QuizPlayer,
} from '../../api/quizApi';
import {
  recordQuizGameScore,
  getMergedQuizLeaderboard,
  getDynamicQuizUserStats,
  QUIZ_LEADERBOARD_CHANGED_EVENT,
  isPlayerMatch,
} from '../../services/gamesLeaderboardService';

// Screen assets & components
import qbg from '../../assets/games/quiz/qbg.png';
import qcard from '../../assets/games/quiz/qcard.png';
import cartoon1 from '../../assets/games/quiz/cartoon1.png';
import cartoon2 from '../../assets/games/quiz/cartoon2.png';
import cartoon3 from '../../assets/games/quiz/cartoon3.png';
import screenArenaClean from '../../assets/games/quiz/quivio_arena_clean_canvas.png';
import gameWaveBg from '../../assets/games/quiz/game_wave_bg.png';
import personSvg from '../../assets/games/quiz/unnamed 20.svg';
import decorBulb from '../../assets/games/quiz/mascot_decor_bulb.png';
import quivioBadge from '../../assets/games/quiz/quivio_badge_clean.png';
import trophyGolden from '../../assets/games/quiz/trophy_golden_clean.png';
import cardClipboard from '../../assets/games/quiz/icon_clipboard_hd.png';
import cardStopwatch from '../../assets/games/quiz/icon_stopwatch_hd.png';
import cardGift from '../../assets/games/quiz/icon_gift_hd.png';
import pillarBadge1 from '../../assets/games/quiz/pillar_badge_1.png';
import pillarBadge2 from '../../assets/games/quiz/pillar_badge_2.png';
import pillarBadge3 from '../../assets/games/quiz/pillar_badge_3.png';
import pillarBadge4 from '../../assets/games/quiz/pillar_badge_4.png';
import quizBottomSectionHd from '../../assets/games/quiz/quiz_bottom_section_hd.png';


// SVG Ribbon Medal for Ranks 1, 2, 3
const RibbonMedal: React.FC<{ rank: 1 | 2 | 3 }> = ({ rank }) => {
  const configs = {
    1: {
      ribbonDark: '#CA8A04',
      ribbonLight: '#EAB308',
      circleOuter: '#FACC15',
      circleStroke: '#CA8A04',
      circleInner: '#EAB308',
      star: '#0F172A',
    },
    2: {
      ribbonDark: '#64748B',
      ribbonLight: '#94A3B8',
      circleOuter: '#E2E8F0',
      circleStroke: '#94A3B8',
      circleInner: '#CBD5E1',
      star: '#0F172A',
    },
    3: {
      ribbonDark: '#C2410C',
      ribbonLight: '#EA580C',
      circleOuter: '#FB923C',
      circleStroke: '#C2410C',
      circleInner: '#EA580C',
      star: '#0F172A',
    },
  }[rank];

  return (
    <svg width="17" height="21" viewBox="0 0 20 24" fill="none" className="shrink-0 drop-shadow-sm">
      <path d="M4 1L10 7L16 1L14 11L10 8L6 11L4 1Z" fill={configs.ribbonDark} />
      <path d="M5 1L10 6L15 1L13.5 9L10 7L6.5 9L5 1Z" fill={configs.ribbonLight} />
      <circle cx="10" cy="15" r="7" fill={configs.circleOuter} stroke={configs.circleStroke} strokeWidth="0.8" />
      <circle cx="10" cy="15" r="5.2" fill={configs.circleInner} />
      <path d="M10 11.5L11.2 14.1L14 14.3L11.8 16L12.5 18.7L10 17.2L7.5 18.7L8.2 16L6 14.3L8.8 14.1L10 11.5Z" fill={configs.star} />
    </svg>
  );
};

// Fallback leaderboard entries from reference layout
const LEADERBOARD_FALLBACK = [
  { rank: 1, name: 'Sakshi Chavan', score: 10 },
  { rank: 2, name: 'Prajesh kumar', score: 10 },
  { rank: 3, name: 'Burhan Partapurwala', score: 10 },
  { rank: 4, name: 'Pooja Suresh Harne', score: 10 },
  { rank: 5, name: 'Bhagyashree Appasaheb Rodage', score: 10 },
  { rank: 6, name: 'Shejal Vaman Kamble', score: 10 },
  { rank: 7, name: 'Vivek Pise', score: 10 },
  { rank: 8, name: 'Devashish Pal', score: 9 },
  { rank: 9, name: 'Sanket Sangale', score: 8 },
  { rank: 10, name: 'Sahil Mujawar', score: 7 },
];

// Fallback questions for interactive play
const FALLBACK_QUESTIONS = [
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    correct: 1,
  },
  {
    question: 'What is the standard unit of electrical resistance?',
    options: ['Ampere', 'Volt', 'Ohm', 'Watt'],
    correct: 2,
  },
  {
    question: 'Which cognitive skill is most improved by playing trivia and puzzle games?',
    options: ['Problem Solving', 'Typing Speed', 'Hearing Pitch', 'Sleep Duration'],
    correct: 0,
  },
  {
    question: 'How many bones are in the adult human body?',
    options: ['186', '206', '226', '246'],
    correct: 1,
  },
  {
    question: 'Which chemical element is represented by the symbol "Au"?',
    options: ['Silver', 'Copper', 'Gold', 'Platinum'],
    correct: 2,
  },
];

// Web Audio sound synthesizer
const playSound = (type: 'click' | 'correct' | 'wrong' | 'timeout' | 'finish') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'timeout') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'finish') {
      const arpeggio = [440, 554.37, 659.25, 880];
      arpeggio.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    }
  } catch {
    // Autoplay restrictions handled
  }
};

export const QuizGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Screen View: 'lobby' | 'arena' | 'score'
  const [view, setView] = useState<'lobby' | 'arena' | 'score'>('lobby');

  // Active Game State
  const [session, setSession] = useState<QuizSessionData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Local fallback state
  const [fallbackMode, setFallbackMode] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [fallbackScore, setFallbackScore] = useState(0);
  const [fallbackCorrectCount, setFallbackCorrectCount] = useState(0);
  const [fallbackWrongCount, setFallbackWrongCount] = useState(0);

  // Feedback State: 'idle' | 'correct' | 'wrong' | 'timeout'
  const [questionFeedback, setQuestionFeedback] = useState<'idle' | 'correct' | 'wrong' | 'timeout'>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<number[]>([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);

  // User identity
  const currentUserName = user?.name || user?.username || 'Sakshi Chavan';
  const currentUserId = user?.user_id || user?.id || 37;

  // Leaderboard data initialized from synchronized dynamic store
  const [leaderboard, setLeaderboard] = useState<QuizPlayer[]>(() =>
    getMergedQuizLeaderboard(undefined, currentUserName, currentUserId)
  );

  const loadLeaderboard = useCallback(() => {
    fetchQuizLeaderboard()
      .then((data) => {
        const merged = getMergedQuizLeaderboard(data?.players, currentUserName, currentUserId);
        setLeaderboard(merged);
      })
      .catch((err) => {
        console.warn('Leaderboard fetch warning:', err);
        const merged = getMergedQuizLeaderboard(undefined, currentUserName, currentUserId);
        setLeaderboard(merged);
      });
  }, [currentUserName, currentUserId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Reactive listener to keep leaderboard strictly in sync across all components
  useEffect(() => {
    const handleSync = () => {
      setLeaderboard(getMergedQuizLeaderboard(undefined, currentUserName, currentUserId));
    };
    window.addEventListener(QUIZ_LEADERBOARD_CHANGED_EVENT, handleSync);
    return () => window.removeEventListener(QUIZ_LEADERBOARD_CHANGED_EVENT, handleSync);
  }, [currentUserName, currentUserId]);

  // 15-second Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Enforce zero vertical scrollbars across browsers
  useEffect(() => {
    document.documentElement.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    document.body.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    return () => {
      document.documentElement.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
      document.body.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
    };
  }, []);

  // Handle Question Timeout
  const handleTimeout = useCallback(() => {
    if (questionFeedback !== 'idle') return;
    playSound('timeout');
    setQuestionFeedback('timeout');

    if (fallbackMode) {
      setFallbackScore((prev) => prev - 1);
      setFallbackWrongCount((prev) => prev + 1);
    }
  }, [questionFeedback, fallbackMode]);

  // Timer countdown effect
  useEffect(() => {
    if (view !== 'arena' || isPaused || questionFeedback !== 'idle' || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, isPaused, questionFeedback, isCompleted, handleTimeout]);

  // Start New Quiz Session
  const handleStartQuiz = async () => {
    playSound('click');
    setIsStarting(true);
    try {
      let data = await startQuizSession();

      // If backend returned a stale session from a previous day/abandoned round that has expired:
      if (data && data.status === 'playing' && (data.feedback !== null || (data.deadline && Date.now() >= data.deadline - 2000))) {
        let s = data;
        let safety = 0;
        while (s && s.status === 'playing' && safety < 10) {
          safety++;
          if (s.feedback === null) {
            for (let opt = 0; opt < 4; opt++) {
              try {
                s = await answerQuizQuestion(s.id, s.index, opt);
                if (s.feedback !== null) break;
              } catch {
                break;
              }
            }
          }
          try {
            s = await nextQuizQuestion(s.id, s.index);
          } catch {
            break;
          }
          if (s.status === 'completed') break;
        }
        // Start a brand new, clean 5-question round!
        data = await startQuizSession();
      }

      if (data && data.question) {
        setSession(data);
        setFallbackMode(false);
        setView('arena');
        const remaining = data.deadline ? Math.max(1, Math.min(15, Math.round((data.deadline - (data.serverNow || Date.now())) / 1000))) : (data.rules?.secondsPerQuestion || 15);
        setTimeLeft(remaining);
        setQuestionFeedback(data.feedback || 'idle');
        setSelectedOption(data.selected ?? null);
        setWrongAttempts(data.attempts || []);
        setCorrectOptionIndex(null);
        setIsCompleted(data.status === 'completed');
      } else {
        throw new Error('Invalid session response');
      }
    } catch (err) {
      console.warn('Starting local interactive session:', err);
      setFallbackMode(true);
      setFallbackIndex(0);
      setFallbackScore(0);
      setFallbackCorrectCount(0);
      setFallbackWrongCount(0);
      setView('arena');
      setTimeLeft(15);
      setQuestionFeedback('idle');
      setSelectedOption(null);
      setWrongAttempts([]);
      setCorrectOptionIndex(null);
      setIsCompleted(false);
    } finally {
      setIsStarting(false);
    }
  };

  // User Selects an Option
  const handleSelectOption = async (optionIdx: number) => {
    if (questionFeedback !== 'idle' || isAnswering || wrongAttempts.includes(optionIdx)) {
      return;
    }

    playSound('click');
    setSelectedOption(optionIdx);
    setIsAnswering(true);

    if (fallbackMode) {
      const curQ = FALLBACK_QUESTIONS[fallbackIndex];
      const isCorrect = optionIdx === curQ.correct;

      setTimeout(() => {
        setIsAnswering(false);
        if (isCorrect) {
          playSound('correct');
          setQuestionFeedback('correct');
          setCorrectOptionIndex(optionIdx);
          setFallbackScore((prev) => prev + 2);
          setFallbackCorrectCount((prev) => prev + 1);
        } else {
          playSound('wrong');
          setQuestionFeedback('wrong');
          setWrongAttempts((prev) => [...prev, optionIdx]);
          setFallbackScore((prev) => prev - 1);
          setFallbackWrongCount((prev) => prev + 1);
        }
      }, 250);
      return;
    }

    // Backend Session Answer
    if (session) {
      try {
        const updated = await answerQuizQuestion(session.id, session.index, optionIdx);
        setSession(updated);

        if (updated.feedback === 'correct') {
          playSound('correct');
          setQuestionFeedback('correct');
          setCorrectOptionIndex(optionIdx);
        } else if (updated.feedback === 'timeout') {
          playSound('timeout');
          setQuestionFeedback('timeout');
        } else {
          playSound('wrong');
          setQuestionFeedback('wrong');
          setWrongAttempts(updated.attempts || [...wrongAttempts, optionIdx]);
        }
      } catch (err) {
        console.error('Answer submission error:', err);
      } finally {
        setIsAnswering(false);
      }
    }
  };

  // User Clicks "Try Again"
  const handleTryAgain = () => {
    playSound('click');
    setQuestionFeedback('idle');
    setSelectedOption(null);
  };

  // User Clicks "Exit Quiz"
  const handleExitClick = () => {
    playSound('click');
    setIsPaused(true);
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    playSound('click');
    setShowExitConfirm(false);
    setIsPaused(false);
    setView('lobby');
    loadLeaderboard();
  };

  const handleCancelExit = () => {
    playSound('click');
    setShowExitConfirm(false);
    setIsPaused(false);
  };

  // User Clicks "Continue" to advance
  const handleNextQuestion = async () => {
    playSound('click');

    if (fallbackMode) {
      if (fallbackIndex < FALLBACK_QUESTIONS.length - 1) {
        const nextIdx = fallbackIndex + 1;
        setFallbackIndex(nextIdx);
        setTimeLeft(15);
        setQuestionFeedback('idle');
        setSelectedOption(null);
        setWrongAttempts([]);
        setCorrectOptionIndex(null);
      } else {
        playSound('finish');
        const finalScore = fallbackScore;
        recordQuizGameScore(currentUserName, currentUserId, finalScore);
        const updatedList = getMergedQuizLeaderboard(undefined, currentUserName, currentUserId);
        setLeaderboard(updatedList);
        setIsCompleted(true);
        setView('score');
      }
      return;
    }

    // Backend Session Next
    if (session) {
      try {
        const updated = await nextQuizQuestion(session.id, session.index);
        setSession(updated);

        if (updated.status === 'completed' || updated.index >= (session.total || 5)) {
          playSound('finish');
          const finalScore = typeof updated.score === 'number' ? updated.score : session.score;
          recordQuizGameScore(currentUserName, currentUserId, finalScore);
          const updatedList = getMergedQuizLeaderboard(undefined, currentUserName, currentUserId);
          setLeaderboard(updatedList);
          setIsCompleted(true);
          setView('score');
          loadLeaderboard();
        } else if (updated.index > session.index) {
          const nextSecs = updated.rules?.secondsPerQuestion || 15;
          setTimeLeft(nextSecs);
          setQuestionFeedback(updated.feedback || 'idle');
          setSelectedOption(updated.selected ?? null);
          setWrongAttempts(updated.attempts || []);
          setCorrectOptionIndex(null);
        } else {
          // When clicking Next after a wrong answer, advance question locally if backend held index
          if (session.index < (session.total || 5) - 1) {
            setSession({
              ...session,
              index: session.index + 1,
              feedback: null,
              attempts: [],
              selected: null,
            });
            setTimeLeft(15);
            setQuestionFeedback('idle');
            setSelectedOption(null);
            setWrongAttempts([]);
            setCorrectOptionIndex(null);
          } else {
            playSound('finish');
            const finalScore = session.score || 0;
            recordQuizGameScore(currentUserName, currentUserId, finalScore);
            const updatedList = getMergedQuizLeaderboard(undefined, currentUserName, currentUserId);
            setLeaderboard(updatedList);
            setIsCompleted(true);
            setView('score');
            loadLeaderboard();
          }
        }
      } catch (err) {
        console.error('Next question error:', err);
        if (session.index < (session.total || 5) - 1) {
          setSession({
            ...session,
            index: session.index + 1,
            feedback: null,
            attempts: [],
            selected: null,
          });
          setTimeLeft(15);
          setQuestionFeedback('idle');
          setSelectedOption(null);
          setWrongAttempts([]);
          setCorrectOptionIndex(null);
        } else {
          playSound('finish');
          const finalScore = session.score || 0;
          recordQuizGameScore(currentUserName, currentUserId, finalScore);
          const updatedList = getMergedQuizLeaderboard(undefined, currentUserName, currentUserId);
          setLeaderboard(updatedList);
          setIsCompleted(true);
          setView('score');
          loadLeaderboard();
        }
      }
    }
  };

  // Dynamic Mascot selection:
  // When question shows (idle): cartoon3.png
  // When answer is correct: cartoon1.png
  // When answer is wrong or timeout: cartoon2.png
  const getMascotSrc = () => {
    if (questionFeedback === 'correct') {
      return cartoon1;
    }
    if (questionFeedback === 'wrong' || questionFeedback === 'timeout') {
      return cartoon2;
    }
    return cartoon3;
  };

  // Active question metadata
  const currentQuestionText = fallbackMode
    ? FALLBACK_QUESTIONS[fallbackIndex]?.question
    : session?.question?.question || 'Which planet is known as the Red Planet?';

  const currentOptions: string[] = fallbackMode
    ? FALLBACK_QUESTIONS[fallbackIndex]?.options || ['Earth', 'Mars', 'Jupiter', 'Venus']
    : session?.question?.options || ['Earth', 'Mars', 'Jupiter', 'Venus'];

  const currentQuestionIndex = fallbackMode ? fallbackIndex : session?.index || 0;
  const totalQuestions = fallbackMode ? FALLBACK_QUESTIONS.length : session?.total || 5;
  const currentScore = fallbackMode ? fallbackScore : session?.score || 0;
  const correctCount = fallbackMode ? fallbackCorrectCount : session?.correctCount || 0;
  const wrongCount = fallbackMode ? fallbackWrongCount : session?.wrongCount || 0;
  const userQuizStats = getDynamicQuizUserStats(leaderboard, currentUserName, currentUserId);

  // Option button styling with glowing neon effects matching qcard
  const getOptionStyle = (idx: number) => {
    const isSelectedWrong = wrongAttempts.includes(idx);
    const isSelectedCorrect = correctOptionIndex === idx;

    if (isSelectedCorrect) {
      return 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 border-2 border-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.95)] text-white scale-[1.02]';
    }
    if (isSelectedWrong) {
      return 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.95)] text-white';
    }
    return 'bg-gradient-to-r from-[#0C1B47]/90 via-[#13235A]/90 to-[#0C1B47]/90 border-2 border-[#38BDF8]/80 shadow-[0_0_16px_rgba(56,189,248,0.45)] hover:border-cyan-300 hover:shadow-[0_0_26px_rgba(56,189,248,0.8)] hover:scale-[1.02] text-white';
  };

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#02081E] text-white font-['Plus_Jakarta_Sans',sans-serif] select-none overflow-hidden no-scrollbar">

      {/* ──────────────────────────────────────────────────────────
          SCREEN 1: QUIVIO QUIZ LOBBY (Pure Component UI, Dynamic-Ready)
      ────────────────────────────────────────────────────────── */}
      {view === 'lobby' && (
        <div className="relative w-full h-full animate-fadeIn select-none overflow-hidden bg-[#02081E] flex flex-col justify-between text-white font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Ambient Lighting & Glows */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            {/* Blue radial glow for left card */}
            <div className="absolute top-[12%] left-[18%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
            {/* Purple radial glow for right card */}
            <div className="absolute top-[15%] right-[15%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px]" />
          </div>

          {/* Top Section Wrapper (Breadcrumbs + Main 2 Cards) */}
          <div className="relative z-20 w-full flex flex-col justify-start px-2.5 sm:px-3 md:px-4 pt-2">

          {/* Top Breadcrumb Navigation: < Games > Quiz */}
          <div className="relative z-30 flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-300 font-medium pl-1 shrink-0 mb-1.5 sm:mb-2">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
              title="Back to Games"
            >
              <span className="text-slate-400 group-hover:text-white transition-colors text-base font-bold leading-none">&lt;</span>
              <span className="group-hover:underline font-semibold">Games</span>
            </button>
            <span className="text-slate-600 text-xs font-bold">&gt;</span>
            <span className="text-white font-semibold">Quiz</span>
          </div>

          {/* Main Content Area (Two Cards Side by Side on Desktop, Stacked on Mobile) */}
          <div className="relative z-20 w-full flex-1 md:flex-none md:h-[395px] flex flex-col md:flex-row items-stretch gap-3 sm:gap-4 md:gap-4.5 mt-1 sm:mt-1.5 mb-3 sm:mb-3.5 shrink-0 overflow-y-auto md:overflow-visible no-scrollbar">
            
            {/* ────────── LEFT HERO CARD ────────── */}
            <div className="relative w-full md:flex-[1.45] lg:flex-[1.5] min-h-[350px] md:h-full rounded-[22px] sm:rounded-[26px] overflow-hidden bg-gradient-to-br from-[#060D2E] via-[#081545] to-[#050D2B] border border-[#2563EB]/70 shadow-[inset_0_0_20px_rgba(37,99,235,0.12)] flex flex-col justify-between pt-3.5 sm:pt-4 md:pt-4.5 px-3.5 sm:px-4 md:px-4.5 pb-2.5 sm:pb-3 shrink-0">
              
              {/* Ambient radial lighting behind mascot */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
                <div className="absolute top-[8%] right-[6%] w-[380px] h-[380px] rounded-full bg-purple-600/25 blur-[95px]" />
                <div className="absolute top-[35%] right-[16%] w-[260px] h-[260px] rounded-full bg-cyan-400/15 blur-[80px]" />
              </div>

              {/* Left Content Area (Full width on mobile, 64% on desktop) */}
              <div className="relative z-10 w-full md:w-[64%] h-full flex flex-col justify-between pointer-events-auto">
                {/* Header Info */}
                <div className="flex flex-col items-start shrink-0">
                  {/* Badge + Quivio + Trophy + Pill */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <img
                      src={quivioBadge}
                      alt="Quivio Badge"
                      className="w-9 h-9 sm:w-9.5 sm:h-9.5 md:w-10 md:h-10 rounded-[11px] sm:rounded-[12px] object-cover shadow-[0_4px_16px_rgba(0,0,0,0.6)] border border-white/20"
                    />
                    <div className="flex flex-col items-start justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-sm sm:text-base md:text-lg tracking-tight drop-shadow">
                          Quivio
                        </span>
                        <img
                          src={trophyGolden}
                          alt="Trophy"
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow"
                        />
                      </div>
                      <div className="mt-0.5 px-2 py-0.5 rounded-full bg-[#3B0764]/95 border border-[#A855F7]/60 shadow-sm flex items-center justify-center">
                        <span className="text-[7px] sm:text-[7.5px] font-black uppercase tracking-wider text-purple-200">
                          QUIZ GAME
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Headline & Subtitle */}
                  <div className="mt-2 sm:mt-2.5">
                    <h1 className="text-lg sm:text-xl md:text-[22px] font-black leading-tight tracking-tight text-white drop-shadow">
                      Play Smart Quiz <br />
                      <span className="text-[#38BDF8]">Every Day</span>
                    </h1>
                    <p className="text-[9px] sm:text-[10px] md:text-[10.5px] text-slate-300 mt-0.5 leading-snug drop-shadow max-w-[310px]">
                      Boost knowledge daily, win challenges, become smarter every day.
                    </p>
                  </div>
                </div>

                {/* 3 Square Feature Cards */}
                <div className="flex items-stretch gap-2 sm:gap-3 my-auto py-1 w-full max-w-full md:max-w-[465px] md:ml-8">
                  {/* Card 1: 5 Questions */}
                  <div className="flex-1 min-h-[118px] sm:min-h-[124px] md:min-h-[130px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#0A225C]/90 to-[#041038]/95 border border-[#2563EB]/60 p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(37,99,235,0.28)] hover:border-blue-400 transition-colors">
                    <img
                      src={cardClipboard}
                      alt="5 Questions"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1 drop-shadow"
                    />
                    <span className="font-extrabold text-white text-[10.5px] sm:text-[11.5px] md:text-xs tracking-tight leading-tight">
                      5 Questions
                    </span>
                    <span className="text-[8px] sm:text-[8.5px] md:text-[9px] text-slate-200 leading-tight mt-1">
                      Each quiz has 5 exciting questions.
                    </span>
                  </div>

                  {/* Card 2: Time Limit */}
                  <div className="flex-1 min-h-[118px] sm:min-h-[124px] md:min-h-[130px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#02332F]/90 to-[#011C18]/95 border border-[#10B981]/60 p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(16,185,129,0.28)] hover:border-emerald-400 transition-colors">
                    <img
                      src={cardStopwatch}
                      alt="Time Limit"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1 drop-shadow"
                    />
                    <span className="font-extrabold text-white text-[10.5px] sm:text-[11.5px] md:text-xs tracking-tight leading-tight">
                      Time Limit
                    </span>
                    <span className="text-[8px] sm:text-[8.5px] md:text-[9px] text-slate-200 leading-tight mt-1">
                      You have only <span className="text-[#00F0FF] font-bold">15 seconds</span> to answer each question.
                    </span>
                  </div>

                  {/* Card 3: 2 Rewards Each */}
                  <div className="flex-1 min-h-[118px] sm:min-h-[124px] md:min-h-[130px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#400B4D]/90 to-[#1F0429]/95 border border-[#D946EF]/60 p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(217,70,239,0.28)] hover:border-fuchsia-400 transition-colors">
                    <img
                      src={cardGift}
                      alt="2 Rewards Each"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1 drop-shadow"
                    />
                    <span className="font-extrabold text-white text-[10.5px] sm:text-[11.5px] md:text-xs tracking-tight leading-tight">
                      2 Rewards Each
                    </span>
                    <span className="text-[8px] sm:text-[8.5px] md:text-[9px] text-slate-200 leading-tight mt-1">
                      Earn <span className="text-[#FBBF24] font-bold">2 rewards</span> for every question you answer.
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Centered Start Quiz Button + Disclaimer */}
                <div className="flex flex-col items-center w-full shrink-0">
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    disabled={isStarting}
                    aria-label="Start Quiz"
                    className="w-[200px] sm:w-[225px] md:w-[245px] h-8 sm:h-8.5 md:h-9 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-[#0F172A] font-extrabold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 shadow-[0_4px_22px_rgba(245,158,11,0.65)] border border-amber-200 cursor-pointer hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>{isStarting ? 'Starting...' : 'Start Quiz'}</span>
                    <PlayArrowIcon sx={{ fontSize: 18 }} />
                  </button>

                  <div className="mt-0.5 flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-400 font-medium">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-500 text-[7.5px] flex items-center justify-center font-bold">i</span>
                    <span>Quiz points are separate from wallet rewards</span>
                  </div>
                </div>
              </div>

              {/* Mascot Floating Layer (Positioned at the TOP of the card) */}
              <div className="absolute right-2 sm:right-3 md:right-4 top-2 sm:top-2.5 bottom-2 w-[28%] sm:w-[30%] max-w-[220px] pointer-events-none select-none z-20 flex items-start justify-center">
                
                {/* 1. Glowing lightbulb over his left shoulder */}
                <div className="absolute top-1 -right-1 sm:-right-1.5 z-20 animate-pulse">
                  <img
                    src={decorBulb}
                    alt=""
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_16px_rgba(250,204,21,0.95)]"
                  />
                </div>

                {/* 2. Top-left neon question mark (above peace sign) */}
                <div className="absolute top-1 -left-2 sm:-left-3 z-20 text-transparent bg-clip-text bg-gradient-to-b from-[#FFA7E7] via-[#FF3BD4] to-[#C026D3] font-black text-xl sm:text-2xl filter drop-shadow-[0_0_10px_rgba(236,72,153,0.95)] -rotate-12 select-none">
                  ?
                </div>

                {/* 3. Bottom-left neon question mark (waist level) */}
                <div className="absolute top-[42%] -left-4 sm:-left-5 z-20 text-transparent bg-clip-text bg-gradient-to-b from-[#FFA7E7] via-[#FF3BD4] to-[#C026D3] font-black text-base sm:text-lg filter drop-shadow-[0_0_8px_rgba(236,72,153,0.95)] rotate-6 select-none">
                  ?
                </div>

                {/* 4. Golden sparkle stars */}
                <div className="absolute -top-1 right-12 text-amber-300 text-[10px] sm:text-xs drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]">✦</div>
                <div className="absolute top-9 -left-3 text-amber-300 text-[10px] drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]">✦</div>
                <div className="absolute top-[46%] -left-6 text-amber-300 text-xs drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]">✦</div>
                <div className="absolute top-20 -right-1 text-amber-300 text-[10px] drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]">✦</div>

                {/* 5. Glowing orbital swoosh loop (behind chest, in front of legs) */}
                <svg className="absolute w-[210px] h-[135px] top-[30%] -left-[18px] -rotate-12 pointer-events-none select-none z-0" viewBox="0 0 270 175">
                  <defs>
                    <linearGradient id="orbitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
                      <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#C084FC" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#EC4899" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <ellipse cx="135" cy="88" rx="120" ry="50" fill="none" stroke="url(#orbitGrad)" strokeWidth="6" filter="url(#orbitGlow)" />
                </svg>

                {/* 6. The User-Provided Person Image (unnamed 20.svg) */}
                <img
                  src={personSvg}
                  alt="Quivio Scholar Mascot"
                  className="relative z-10 h-[94%] sm:h-[96%] max-h-[325px] sm:max-h-[335px] w-auto object-contain object-top drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  draggable={false}
                />
              </div>

            </div>

            {/* ────────── RIGHT LEADERBOARD CARD ────────── */}
            <div className="relative flex-1 h-full rounded-[22px] sm:rounded-[26px] overflow-hidden bg-gradient-to-br from-[#060D2E]/95 via-[#081545]/95 to-[#050D2B]/95 border border-[#2563EB]/70 shadow-[inset_0_0_20px_rgba(37,99,235,0.12)] flex flex-col justify-between pt-3 sm:pt-3.5 px-2 sm:px-2.5 pb-2">
              
              {/* Leaderboard Header */}
              <div
                onClick={() => navigate('/games/leaderboard?tab=quiz')}
                className="flex items-center justify-between px-2 py-1 shrink-0 cursor-pointer group hover:bg-white/[0.04] rounded-lg transition-colors"
                title="Open Full Games Leaderboard"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <img
                    src={trophyGolden}
                    alt="Trophy"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow"
                  />
                  <span className="font-bold text-white text-xs sm:text-sm md:text-base tracking-wide drop-shadow group-hover:text-amber-300 transition-colors">
                    Leaderboard
                  </span>
                  <img
                    src={trophyGolden}
                    alt="Trophy"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow"
                  />
                </div>
                <span className="text-[10px] text-cyan-300 group-hover:text-cyan-200 font-extrabold flex items-center">
                  Full View ›
                </span>
              </div>

              {/* Inner Table Compartment */}
              <div className="flex-1 rounded-2xl bg-[#040E2A]/75 border border-blue-500/30 p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden shadow-inner mt-1">
                {/* Table Header */}
                <div className="flex items-center px-2 py-0.5 sm:py-1 border-b border-white/10 text-[10px] sm:text-[10.5px] font-semibold text-slate-400 shrink-0">
                  <span className="w-10 sm:w-11 text-center">Rank</span>
                  <span className="flex-1 text-left pl-3">Player</span>
                  <span className="w-10 sm:w-11 text-right pr-2">Score</span>
                </div>

                {/* 10 Rows (Dynamic Synchronized Leaderboard) */}
                <div className="flex-1 flex flex-col justify-between py-0.5 min-h-0">
                  {leaderboard.slice(0, 10).map((player, idx) => {
                    const rank = idx + 1;
                    const isCurrentUser = isPlayerMatch(player, currentUserName, currentUserId);
                    const initial = player.name ? player.name.trim().charAt(0).toUpperCase() : '?';
                    return (
                      <div
                        key={player.name + idx}
                        className={`flex items-center px-2 py-0.5 rounded transition-colors ${
                          isCurrentUser
                            ? 'bg-blue-600/25 border border-cyan-400/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                            : idx < 9
                            ? 'border-b border-white/[0.04]'
                            : ''
                        }`}
                      >
                        {/* Rank Column */}
                        <div className="w-10 sm:w-11 flex items-center justify-center shrink-0">
                          {rank <= 3 ? (
                            <RibbonMedal rank={rank as 1 | 2 | 3} />
                          ) : (
                            <span className="text-[10.5px] sm:text-xs text-slate-300 font-semibold">{rank}</span>
                          )}
                        </div>

                        {/* Player Column */}
                        <div className="flex-1 flex items-center gap-2 min-w-0 pl-3">
                          <div className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full ${isCurrentUser ? 'bg-cyan-600 border border-cyan-300 text-white font-black' : 'bg-[#1E3A8A]/70 border border-[#3B82F6]/60 text-[#BFDBFE] font-bold'} text-[9px] sm:text-[9.5px] flex items-center justify-center shrink-0 shadow-sm`}>
                            {initial}
                          </div>
                          <span className={`text-[10.5px] sm:text-xs ${isCurrentUser ? 'text-cyan-200 font-bold' : 'text-white font-medium'} truncate`}>
                            {player.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[7.5px] font-black text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-400/40 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>

                        {/* Score Column */}
                        <div className={`w-10 sm:w-11 text-right pr-2 text-[10.5px] sm:text-xs ${isCurrentUser ? 'text-amber-300 font-black' : 'text-white font-semibold'} shrink-0`}>
                          {player.score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* ────────── BOTTOM FEATURES SECTION (FULL WIDTH) ────────── */}
          <div className="relative z-20 w-full shrink-0 flex flex-col items-center mt-auto pb-0 select-none overflow-hidden">
            <img
              src={quizBottomSectionHd}
              alt="Quivio Features - Earn RP Points, Improve Your Knowledge, Fun for Everyone, Safe & Secure"
              className="w-full h-auto object-cover object-bottom pointer-events-none select-none block"
              draggable={false}
            />
            {/* Screen reader accessibility */}
            <div className="sr-only">
              <h3>Earn RP Points</h3>
              <p>Play quizzes and earn exciting Reward Planner points.</p>
              <h3>Improve Your Knowledge</h3>
              <p>Learn new facts and challenge yourself daily.</p>
              <h3>Fun for Everyone</h3>
              <p>Quick, engaging and refreshing quizzes.</p>
              <h3>Safe & Secure</h3>
              <p>A fair and enjoyable experience with MPS Global.</p>
              <p>Play • Learn • Earn</p>
            </div>
          </div>
        </div>
      )}




      {/* ──────────────────────────────────────────────────────────
          SCREEN 2: INTERACTIVE GAME ARENA (Responsive Desktop & Mobile)
      ────────────────────────────────────────────────────────── */}
      {view === 'arena' && (
        <div className="relative w-full h-full bg-[#02081E] flex items-center justify-center animate-scaleUp select-none overflow-hidden">
          {/* Layer 1: Full-Width Ambient Underwater Space Background (qbg.png) */}
          <img
            src={qbg}
            alt="Quivio Quiz Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
            draggable={false}
          />

          {/* Floating Exit Button for Instant Desktop Visibility */}
          <button
            type="button"
            onClick={handleExitClick}
            aria-label="Exit Quiz"
            title="Exit Quiz"
            className="hidden md:flex absolute top-3 sm:top-4 left-3 sm:left-4 z-40 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C0E28]/85 hover:bg-[#2D143D] text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.35)] backdrop-blur-md cursor-pointer transition-all active:scale-95 group"
          >
            <CloseIcon sx={{ fontSize: 16 }} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>Exit Quiz</span>
          </button>

          {/* ══════════════════════════════════════════════════════════
              DESKTOP ARENA CANVAS (md: and above, e.g. 1366x768)
          ══════════════════════════════════════════════════════════ */}
          <div
            className="hidden md:flex relative items-center justify-center select-none z-10"
            style={{ width: 'min(96vw, calc(92vh * 1.5))', height: 'min(92vh, calc(96vw / 1.5))' }}
          >
            {/* Card Graphic with Logo, Neon Border, Planets, Seabed */}
            <img
              src={qcard}
              alt="Quivio Quiz Card"
              className="w-full h-full object-fill block select-none pointer-events-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              draggable={false}
            />

            {/* Mascot */}
            <img
              src={getMascotSrc()}
              alt="Quivio Earth Mascot"
              className={`absolute left-[5.5%] top-[47%] w-[26%] h-auto object-contain select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] z-20 transition-all duration-300 ${
                questionFeedback === 'correct' ? 'animate-scaleUp' : questionFeedback === 'wrong' ? 'animate-shake' : ''
              }`}
              draggable={false}
            />

            {/* Top-Left Exit Button Badge (Mirroring Top-Right Timer) */}
            <button
              type="button"
              onClick={handleExitClick}
              aria-label="Exit Quiz"
              title="Exit Quiz"
              className="absolute left-[11.6%] top-[22.5%] -translate-x-1/2 -translate-y-1/2 w-[5.4%] aspect-square rounded-full bg-gradient-to-b from-[#3B0715]/95 via-[#23040C]/95 to-[#0F0105] border-2 border-rose-500/80 shadow-[0_0_18px_rgba(244,63,94,0.7)] flex items-center justify-center text-rose-300 hover:text-white cursor-pointer active:scale-95 hover:scale-105 transition-all z-30 select-none group"
            >
              <CloseIcon sx={{ fontSize: 'clamp(13px, 1.35vw, 19px)' }} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Top-Right Circular Countdown Timer Badge */}
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={`Timer: ${timeLeft} seconds remaining. Click to pause.`}
              title={`Time Left: ${timeLeft}s (Click to pause)`}
              className={`absolute left-[88.4%] top-[22.5%] -translate-x-1/2 -translate-y-1/2 w-[5.4%] aspect-square rounded-full bg-gradient-to-b from-[#0B1A42]/95 via-[#06102D]/95 to-[#020718] flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 transition-all z-30 select-none group ${
                timeLeft <= 5
                  ? 'border-2 border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.95)] animate-pulse'
                  : 'border-2 border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.75)]'
              }`}
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-[1.5px]" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="19" fill="none" stroke={timeLeft <= 5 ? 'rgba(244,63,94,0.2)' : 'rgba(56,189,248,0.2)'} strokeWidth="2.8" />
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke={timeLeft <= 5 ? '#F43F5E' : '#38BDF8'}
                  strokeWidth="2.8"
                  strokeDasharray={119.38}
                  strokeDashoffset={119.38 - (Math.max(0, timeLeft) / 15) * 119.38}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              <div className="relative flex items-baseline justify-center font-black tracking-tight leading-none z-10">
                <span className={`font-black tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${timeLeft <= 5 ? 'text-rose-400 font-extrabold' : 'text-cyan-300'}`} style={{ fontSize: 'clamp(11px, 1.35vw, 17px)' }}>
                  {timeLeft}
                </span>
                <span className={`font-bold ml-[1px] uppercase ${timeLeft <= 5 ? 'text-rose-300' : 'text-cyan-200'}`} style={{ fontSize: 'clamp(7px, 0.75vw, 10px)' }}>
                  s
                </span>
              </div>
            </button>

            {/* Dynamic Question Counter */}
            <div className="absolute left-[50.5%] -translate-x-1/2 top-[32%] text-[13px] sm:text-[14px] md:text-[15px] font-black text-slate-100 tracking-wider pointer-events-none z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] select-none">
              {currentQuestionIndex + 1} / {totalQuestions}
            </div>

            {/* Dynamic Progress Bar */}
            <div className="absolute left-[38%] top-[36%] w-[25%] h-[1.3%] rounded-full overflow-hidden bg-[#161044]/90 border border-cyan-400/50 p-[1px] pointer-events-none z-20 shadow-[0_0_12px_rgba(56,189,248,0.6)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 shadow-[0_0_10px_rgba(56,189,248,0.9)] transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(12, ((currentQuestionIndex + 1) / totalQuestions) * 100))}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="absolute left-[29%] w-[48%] top-[40%] h-[12.5%] flex flex-col items-center justify-center text-center px-3 pointer-events-none z-20">
              {questionFeedback === 'idle' && (
                <h2 className="font-black text-white text-base sm:text-lg md:text-xl lg:text-[22px] tracking-tight leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] max-w-[500px] mx-auto animate-fadeIn">
                  {currentQuestionText}
                </h2>
              )}
              {questionFeedback === 'wrong' && (
                <div className="flex flex-col items-center justify-center animate-shake w-full">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex items-center gap-1.5 sm:gap-2">
                    <span className="text-amber-300 text-lg sm:text-xl">✨</span>
                    <span className="text-[#38BDF8]">OOPS!</span>
                    <span className="text-[#F43F5E] ml-1">TRY AGAIN!</span>
                    <span className="text-amber-300 text-lg sm:text-xl">✨</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-200 mt-0.5 sm:mt-1 font-bold drop-shadow">
                    That wasn't quite right. Give it another shot!
                  </p>
                </div>
              )}
              {questionFeedback === 'correct' && (
                <div className="flex flex-col items-center justify-center animate-scaleUp w-full">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex items-center gap-1.5 sm:gap-2">
                    <span className="text-amber-300 text-lg sm:text-xl">🌟</span>
                    <span>YOU ARE</span>
                    <span className="text-[#10B981] ml-1">GENIUS!</span>
                    <span className="text-amber-300 text-lg sm:text-xl">🌟</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-300 mt-0.5 sm:mt-1 font-bold drop-shadow">
                    That's correct! +2 Rewards earned!
                  </p>
                </div>
              )}
              {questionFeedback === 'timeout' && (
                <div className="flex flex-col items-center justify-center animate-shake w-full">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-rose-400 tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    TIME'S UP!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-bold">
                    You ran out of time on this question!
                  </p>
                </div>
              )}
            </div>

            {/* 4 Options Grid */}
            {currentOptions[0] && (
              <button
                type="button"
                onClick={() => handleSelectOption(0)}
                disabled={questionFeedback !== 'idle' || isAnswering || wrongAttempts.includes(0)}
                className={`absolute left-[33%] top-[53.5%] w-[21.5%] h-[8.8%] rounded-full font-black text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center px-4 cursor-pointer select-none active:scale-95 transition-all z-20 ${getOptionStyle(0)}`}
              >
                <span className="truncate drop-shadow">{currentOptions[0]}</span>
              </button>
            )}

            {currentOptions[1] && (
              <button
                type="button"
                onClick={() => handleSelectOption(1)}
                disabled={questionFeedback !== 'idle' || isAnswering || wrongAttempts.includes(1)}
                className={`absolute left-[56.5%] top-[53.5%] w-[21.5%] h-[8.8%] rounded-full font-black text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center px-4 cursor-pointer select-none active:scale-95 transition-all z-20 ${getOptionStyle(1)}`}
              >
                <span className="truncate drop-shadow">{currentOptions[1]}</span>
              </button>
            )}

            {currentOptions[2] && (
              <button
                type="button"
                onClick={() => handleSelectOption(2)}
                disabled={questionFeedback !== 'idle' || isAnswering || wrongAttempts.includes(2)}
                className={`absolute left-[33%] top-[64.5%] w-[21.5%] h-[8.8%] rounded-full font-black text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center px-4 cursor-pointer select-none active:scale-95 transition-all z-20 ${getOptionStyle(2)}`}
              >
                <span className="truncate drop-shadow">{currentOptions[2]}</span>
              </button>
            )}

            {currentOptions[3] && (
              <button
                type="button"
                onClick={() => handleSelectOption(3)}
                disabled={questionFeedback !== 'idle' || isAnswering || wrongAttempts.includes(3)}
                className={`absolute left-[56.5%] top-[64.5%] w-[21.5%] h-[8.8%] rounded-full font-black text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center px-4 cursor-pointer select-none active:scale-95 transition-all z-20 ${getOptionStyle(3)}`}
              >
                <span className="truncate drop-shadow">{currentOptions[3]}</span>
              </button>
            )}

            {/* Action Buttons */}
            {questionFeedback === 'wrong' && (
              <div className="absolute left-[31%] w-[49%] top-[75.5%] h-[8%] flex items-center justify-center gap-3 z-30">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="w-1/2 h-full rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-[#1E1B4B] font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-1.5 shadow-[0_0_25px_rgba(251,191,36,0.8)] border-2 border-amber-200 active:scale-95 cursor-pointer hover:brightness-110 transition-all"
                >
                  <ReplayIcon sx={{ fontSize: 18 }} />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-1/2 h-full rounded-full bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-slate-950 font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-1.5 shadow-[0_0_25px_rgba(56,189,248,0.8)] border-2 border-cyan-200 active:scale-95 cursor-pointer hover:brightness-110 transition-all"
                >
                  <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish Quiz'}</span>
                  <span className="text-xl leading-none">›</span>
                </button>
              </div>
            )}

            {(questionFeedback === 'correct' || questionFeedback === 'timeout') && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="absolute left-[37%] top-[75.5%] w-[28%] h-[8%] rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-[#1E1B4B] font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.8)] border-2 border-amber-200 active:scale-95 cursor-pointer z-30 hover:brightness-110 transition-all"
              >
                <span>{currentQuestionIndex < totalQuestions - 1 ? 'Continue' : 'Finish Quiz'}</span>
                <span className="text-xl leading-none">›</span>
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              MOBILE ARENA LAYOUT (For mobile app screens / phones < 768px)
          ══════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden flex-col justify-between w-full h-full max-w-md mx-auto px-4 py-3 z-10 select-none overflow-y-auto no-scrollbar">
            {/* Top Bar: Back, Question Counter & Prominent Timer */}
            <div className="flex items-center justify-between gap-3 shrink-0 pt-1 pb-2">
              <button
                type="button"
                onClick={handleExitClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 border border-rose-500/40 font-bold text-xs cursor-pointer transition-all shadow-sm"
                title="Exit Quiz"
              >
                <CloseIcon sx={{ fontSize: 15 }} />
                <span>Exit</span>
              </button>

              {/* Center: Counter & Progress */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-black text-cyan-200 uppercase tracking-wider mb-1">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <div className="w-full max-w-[160px] h-2 rounded-full overflow-hidden bg-[#161044] border border-cyan-400/50 p-[1px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, ((currentQuestionIndex + 1) / totalQuestions) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Right Corner: Large Glowing Countdown Timer */}
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className={`relative w-11 h-11 rounded-full bg-[#0B1A42] flex items-center justify-center border-2 shrink-0 ${
                  timeLeft <= 5
                    ? 'border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.9)] animate-pulse'
                    : 'border-[#38BDF8] shadow-[0_0_14px_rgba(56,189,248,0.7)]'
                }`}
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-[2px]" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="3" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke={timeLeft <= 5 ? '#F43F5E' : '#38BDF8'}
                    strokeWidth="3"
                    strokeDasharray={113.1}
                    strokeDashoffset={113.1 - (Math.max(0, timeLeft) / 15) * 113.1}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                  />
                </svg>
                <span className={`text-xs font-black ${timeLeft <= 5 ? 'text-rose-400 font-extrabold' : 'text-cyan-300'}`}>
                  {timeLeft}s
                </span>
              </button>
            </div>

            {/* Center Body: Mascot + Question + Options */}
            <div className="my-auto py-2 flex flex-col items-center w-full">
              {/* Dynamic Mascot with expression changes */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 flex items-center justify-center">
                <img
                  src={getMascotSrc()}
                  alt="Mascot"
                  className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Glowing Question Box (Never overlaps logo!) */}
              <div className="w-full rounded-2xl bg-gradient-to-b from-[#0F1E4C]/95 via-[#081545]/95 to-[#040A26]/95 border border-cyan-400/40 p-3.5 text-center shadow-[0_4px_25px_rgba(0,0,0,0.5)] mb-3.5">
                {questionFeedback === 'idle' && (
                  <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {currentQuestionText}
                  </h2>
                )}
                {questionFeedback === 'wrong' && (
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-rose-400">OOPS! TRY AGAIN!</h2>
                    <p className="text-xs text-slate-300 mt-0.5">That wasn't quite right.</p>
                  </div>
                )}
                {questionFeedback === 'correct' && (
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-emerald-400">YOU ARE GENIUS!</h2>
                    <p className="text-xs text-emerald-200 mt-0.5">That's correct! +2 Rewards earned!</p>
                  </div>
                )}
                {questionFeedback === 'timeout' && (
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-rose-400">TIME'S UP!</h2>
                    <p className="text-xs text-slate-300 mt-0.5">You ran out of time on this question!</p>
                  </div>
                )}
              </div>

              {/* 4 Options Grid (Full width, clear text, no truncation) */}
              <div className="w-full space-y-2.5">
                {currentOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={questionFeedback !== 'idle' || isAnswering || wrongAttempts.includes(idx)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-left flex items-center justify-between transition-all cursor-pointer ${getOptionStyle(idx)}`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    <span className="text-[10px] opacity-60 shrink-0">#{idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Action Button on Mobile */}
            <div className="pt-2 shrink-0">
              {questionFeedback === 'wrong' && (
                <div className="flex items-center gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer border border-amber-200"
                  >
                    <ReplayIcon sx={{ fontSize: 18 }} />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer border border-cyan-200"
                  >
                    <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish Quiz'}</span>
                    <span className="text-base font-bold leading-none">›</span>
                  </button>
                </div>
              )}
              {(questionFeedback === 'correct' || questionFeedback === 'timeout') && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>{currentQuestionIndex < totalQuestions - 1 ? 'Continue' : 'Finish Quiz'}</span>
                  <span className="text-base font-bold">›</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          EXIT CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════ */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F172A] border border-rose-500/50 p-6 text-center shadow-[0_0_40px_rgba(244,63,94,0.35)] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center text-xl font-black">
              ✕
            </div>
            <h3 className="text-xl font-extrabold text-white">Exit Quiz?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to leave this quiz? Your current question progress will be lost.
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmExit}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <span>Yes, Exit Quiz</span>
              </button>
              <button
                type="button"
                onClick={handleCancelExit}
                className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs border border-white/15 cursor-pointer active:scale-95 transition-all"
              >
                Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PAUSE MODAL
      ══════════════════════════════════════════════════════════ */}
      {isPaused && !showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F172A] border border-[#38BDF8]/40 p-6 text-center shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Game Paused</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Take a breath! Your quiz timer is paused.
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#818CF8] font-bold text-sm text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-105"
              >
                <PlayArrowIcon sx={{ fontSize: 18 }} />
                <span>Resume Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setView('lobby');
                }}
                className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 font-semibold text-xs border border-white/10 cursor-pointer"
              >
                Quit to Lobby
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ──────────────────────────────────────────────────────────
          SCREEN 3: QUIZ SCORE & COMPLETION PAGE (Modular Layered Theme)
      ────────────────────────────────────────────────────────── */}
      {view === 'score' && (
        <div className="relative w-full h-full bg-[#02081E] flex items-center justify-center animate-scaleUp select-none overflow-hidden">
          {/* Layer 1: Full-Width Ambient Underwater Space Background (qbg.png) */}
          <img
            src={qbg}
            alt="Quivio Quiz Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
            draggable={false}
          />

          {/* ══════════════════════════════════════════════════════════
              DESKTOP SCORE CANVAS (md: and above)
          ══════════════════════════════════════════════════════════ */}
          <div
            className="hidden md:flex relative items-center justify-center select-none z-10"
            style={{ width: 'min(96vw, calc(92vh * 1.5))', height: 'min(92vh, calc(96vw / 1.5))' }}
          >
            {/* Card Graphic with Logo, Neon Border, Planets, Seabed */}
            <img
              src={qcard}
              alt="Quivio Quiz Card"
              className="w-full h-full object-fill block select-none pointer-events-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              draggable={false}
            />

            {/* Layer 3: Mascot (cartoon1.png) Celebrating */}
            <img
              src={cartoon1}
              alt="Quivio Mascot Celebrating"
              className="absolute left-[5.5%] top-[47%] w-[26%] h-auto object-contain select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] z-20 animate-scaleUp"
              draggable={false}
            />

            {/* Center Score Board Content Area */}
            <div className="absolute left-[28%] w-[49%] top-[33%] bottom-[12%] flex flex-col items-center justify-center text-center px-4 z-20 animate-fadeIn">
              {/* Header Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span className="text-amber-300 text-lg sm:text-2xl">🌟</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
                  QUIZ COMPLETED!
                </h2>
                <span className="text-amber-300 text-lg sm:text-2xl">🌟</span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-200 font-semibold drop-shadow mb-3 sm:mb-4">
                Great job! You finished all {totalQuestions} questions.
              </p>

              {/* Glowing Score Showcase Box */}
              <div className="w-full max-w-[420px] rounded-2xl border-2 border-[#38BDF8]/50 bg-gradient-to-b from-[#0B173B]/90 via-[#07102C]/90 to-[#040A1E]/95 backdrop-blur-md p-3.5 sm:p-4 mb-4 sm:mb-5 shadow-[0_0_25px_rgba(56,189,248,0.35)] space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">Final Score</span>
                    <span className="text-[10px] text-cyan-300 font-bold">Rank #{userQuizStats.rank} • High: {userQuizStats.bestScore} PTS</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]">
                    {currentScore} PTS
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-500/20 text-center">
                  <div className="rounded-xl bg-white/5 p-1.5 sm:p-2 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Correct</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400">{correctCount} / {totalQuestions}</span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-1.5 sm:p-2 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Wrong</span>
                    <span className="text-xs sm:text-sm font-extrabold text-rose-400">{wrongCount}</span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-1.5 sm:p-2 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Earned</span>
                    <span className="text-xs sm:text-sm font-extrabold text-cyan-300">+{Math.max(0, currentScore * 5)} RP</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[420px]">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="w-full sm:w-1/2 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-[#1E1B4B] font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(251,191,36,0.85)] border-2 border-amber-200 active:scale-95 hover:scale-105 cursor-pointer transition-all"
                >
                  <ReplayIcon sx={{ fontSize: 18 }} />
                  <span>Play Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    navigate('/games/leaderboard?tab=quiz');
                  }}
                  className="w-full sm:w-1/2 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-slate-950 font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(56,189,248,0.85)] border-2 border-cyan-200 active:scale-95 hover:scale-105 cursor-pointer transition-all"
                >
                  <LeaderboardIcon sx={{ fontSize: 18 }} />
                  <span>Go to Leaderboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              MOBILE SCORE LAYOUT (For mobile app screens / phones < 768px)
          ══════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden flex-col justify-between items-center w-full h-full max-w-md mx-auto px-4 py-6 z-10 select-none overflow-y-auto no-scrollbar text-center">
            {/* Header */}
            <div className="shrink-0 pt-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-amber-300 text-xl">🌟</span>
                <h2 className="text-2xl font-black text-white tracking-wide drop-shadow">
                  QUIZ COMPLETED!
                </h2>
                <span className="text-amber-300 text-xl">🌟</span>
              </div>
              <p className="text-xs text-cyan-200 font-semibold">
                Great job! You finished all {totalQuestions} questions.
              </p>
            </div>

            {/* Mascot Celebrating */}
            <div className="my-auto py-2 flex items-center justify-center">
              <img
                src={cartoon1}
                alt="Celebrating"
                className="w-36 h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] animate-scaleUp"
              />
            </div>

            {/* Score Showcase Box */}
            <div className="w-full rounded-2xl border-2 border-[#38BDF8]/50 bg-gradient-to-b from-[#0B173B]/95 to-[#040A1E]/95 p-4 mb-4 shadow-[0_0_25px_rgba(56,189,248,0.35)] space-y-3 shrink-0">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Final Score</span>
                  <span className="text-[11px] text-cyan-300 font-bold">Rank #{userQuizStats.rank} • High: {userQuizStats.bestScore} PTS</span>
                </div>
                <span className="text-3xl font-black text-amber-300 drop-shadow">
                  {currentScore} PTS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-500/20 text-center">
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="block text-[10px] text-slate-400 font-medium">Correct</span>
                  <span className="text-sm font-extrabold text-emerald-400">{correctCount} / {totalQuestions}</span>
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="block text-[10px] text-slate-400 font-medium">Wrong</span>
                  <span className="text-sm font-extrabold text-rose-400">{wrongCount}</span>
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="block text-[10px] text-slate-400 font-medium">Earned</span>
                  <span className="text-sm font-extrabold text-cyan-300">+{Math.max(0, currentScore * 5)} RP</span>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="w-full space-y-2.5 shrink-0 pb-2">
              <button
                type="button"
                onClick={handleStartQuiz}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#1E1B4B] font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.8)] border border-amber-200 cursor-pointer active:scale-95"
              >
                <ReplayIcon sx={{ fontSize: 18 }} />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  navigate('/games/leaderboard?tab=quiz');
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.8)] border border-cyan-200 cursor-pointer active:scale-95"
              >
                <LeaderboardIcon sx={{ fontSize: 18 }} />
                <span>Go to Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizGamePage;
