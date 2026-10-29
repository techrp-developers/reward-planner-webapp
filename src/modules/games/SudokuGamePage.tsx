// src/modules/games/SudokuGamePage.tsx
// Complete Sudoku Module integrating backend /v1/sudoku APIs (start, complete, leaderboard)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAuth } from '../../context/AuthContext';
import {
  startSudokuGame,
  completeSudokuGame,
  fetchSudokuLeaderboard,
  SudokuDifficulty,
  SudokuLeaderboardEntry,
} from '../../api/sudokuApi';
import { recordSudokuGameScore } from '../../services/gamesLeaderboardService';

// Fallback 9x9 board in case of offline/network interruption
const FALLBACK_BOARD: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const FALLBACK_SOLUTION: number[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Web Audio sound synthesizer
const playSound = (type: 'click' | 'place' | 'complete' | 'hint') => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click' || type === 'place') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'place' ? 520 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'hint') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'complete') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.28);
      });
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
};

export const SudokuGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Difficulty & Game Meta
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [gameId, setGameId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 9x9 Board State
  const [initialBoard, setInitialBoard] = useState<number[][]>(FALLBACK_BOARD);
  const [currentBoard, setCurrentBoard] = useState<number[][]>(FALLBACK_BOARD);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>(FALLBACK_SOLUTION);

  // Selection & Interactions
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  // Timer State
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Leaderboard Modal State
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<SudokuLeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // Load Leaderboard
  const loadLeaderboard = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetchSudokuLeaderboard();
      if (res && Array.isArray(res.leaderboard)) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.warn('Sudoku leaderboard fetch warning:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  // Format Timer Display mm:ss
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start New Game via Backend API
  const startNewGame = useCallback(
    async (selectedDiff: SudokuDifficulty = difficulty) => {
      playSound('click');
      setIsLoading(true);
      setIsCompleted(false);
      setMistakes(0);
      setSelectedCell(null);
      setSeconds(0);
      setIsTimerRunning(false);

      try {
        const data = await startSudokuGame(selectedDiff);
        if (data && data.success && Array.isArray(data.board) && Array.isArray(data.solution)) {
          setGameId(data.game_id);
          setInitialBoard(data.board.map((r) => [...r]));
          setCurrentBoard(data.board.map((r) => [...r]));
          setSolutionBoard(data.solution.map((r) => [...r]));
        } else {
          throw new Error('Invalid backend board format');
        }
      } catch (err) {
        console.warn('Using local fallback sudoku board:', err);
        setGameId(Date.now());
        setInitialBoard(FALLBACK_BOARD.map((r) => [...r]));
        setCurrentBoard(FALLBACK_BOARD.map((r) => [...r]));
        setSolutionBoard(FALLBACK_SOLUTION.map((r) => [...r]));
      } finally {
        setIsLoading(false);
        setIsTimerRunning(true);
      }
    },
    [difficulty]
  );

  // Initial load on mount
  useEffect(() => {
    startNewGame('easy');
    loadLeaderboard();
  }, [startNewGame, loadLeaderboard]);

  // Enforce zero vertical scrollbars across browsers in Games Module
  useEffect(() => {
    document.documentElement.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    document.body.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    return () => {
      document.documentElement.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
      document.body.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!isTimerRunning || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isCompleted]);

  // Check Board Completion
  const checkCompletion = useCallback(
    async (boardToCheck: number[][]) => {
      // Must have every cell filled
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (boardToCheck[r][c] === 0) return;
        }
      }

      // Must match solution
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (boardToCheck[r][c] !== solutionBoard[r][c]) {
            return;
          }
        }
      }

      // Board is 100% correct! Complete game on backend
      setIsTimerRunning(false);
      playSound('complete');
      setIsCompleted(true);

      const completionTime = seconds;
      const username =
        user?.name ||
        user?.username ||
        (user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'Sakshi Chavan');
      const userId = user?.user_id || user?.id || 37;

      let earned = 6;
      if (gameId) {
        try {
          const res = await completeSudokuGame({
            game_id: gameId,
            completion_time: Math.max(1, completionTime),
            username,
          });
          if (res && res.success) {
            earned = res.points_earned || 6;
          }
        } catch (err) {
          console.warn('Sudoku completion API fallback:', err);
          const basePoints = difficulty === 'expert' ? 7 : difficulty === 'hard' ? 4 : difficulty === 'medium' ? 2 : 1;
          const speedBonus = completionTime < 120 ? 5 : completionTime < 300 ? 3 : completionTime < 600 ? 2 : 1;
          earned = basePoints + speedBonus;
        }
      } else {
        const basePoints = difficulty === 'expert' ? 7 : difficulty === 'hard' ? 4 : difficulty === 'medium' ? 2 : 1;
        const speedBonus = completionTime < 120 ? 5 : completionTime < 300 ? 3 : completionTime < 600 ? 2 : 1;
        earned = basePoints + speedBonus;
      }
      setPointsEarned(earned);
      recordSudokuGameScore(username, userId, earned);
      loadLeaderboard();
    },
    [solutionBoard, seconds, user, gameId, difficulty, loadLeaderboard]
  );

  // Handle Input Number (from On-Screen Pad or Keyboard)
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell || isCompleted) return;
      const [r, c] = selectedCell;

      // Fixed initial clue cannot be modified
      if (initialBoard[r][c] !== 0) return;

      const nextBoard = currentBoard.map((row) => [...row]);
      nextBoard[r][c] = num;
      setCurrentBoard(nextBoard);
      playSound(num === 0 ? 'click' : 'place');

      // Track mistake if incorrect number entered
      if (num !== 0 && num !== solutionBoard[r][c]) {
        setMistakes((prev) => prev + 1);
      }

      // Check for full victory
      checkCompletion(nextBoard);
    },
    [selectedCell, isCompleted, initialBoard, currentBoard, solutionBoard, checkCompletion]
  );

  // Keyboard Shortcuts (1-9, Backspace, Arrow navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || !selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleInputNumber(0);
      } else if (e.key === 'ArrowUp' && r > 0) {
        setSelectedCell([r - 1, c]);
      } else if (e.key === 'ArrowDown' && r < 8) {
        setSelectedCell([r + 1, c]);
      } else if (e.key === 'ArrowLeft' && c > 0) {
        setSelectedCell([r, c - 1]);
      } else if (e.key === 'ArrowRight' && c < 8) {
        setSelectedCell([r, c + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isCompleted, handleInputNumber]);

  // Give Hint for Selected Cell
  const handleHint = () => {
    if (!selectedCell || isCompleted) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    const correctVal = solutionBoard[r][c];
    const nextBoard = currentBoard.map((row) => [...row]);
    nextBoard[r][c] = correctVal;
    setCurrentBoard(nextBoard);
    playSound('hint');
    checkCompletion(nextBoard);
  };

  // Selected cell value for highlighting matches
  const selectedVal = selectedCell ? currentBoard[selectedCell[0]][selectedCell[1]] : null;

  return (
    <div className="relative w-screen h-screen max-h-screen overflow-hidden bg-[#040A1E] text-white font-['Plus_Jakarta_Sans',sans-serif] select-none flex flex-col justify-between">
      {/* ──────────────────────────────────────────────────────────
          1. HEADER BAR: Back, Title, Timer, Leaderboard Button, Points
      ────────────────────────────────────────────────────────── */}
      <header className="w-full max-w-[1300px] mx-auto px-4 pt-3 pb-2 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer shadow-md"
            title="Back to Games"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Sudoku Logic Master</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                9x9 Grid
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 shadow-inner text-cyan-300">
          <TimerIcon sx={{ fontSize: 16 }} className="text-cyan-400 animate-pulse" />
          <span className="font-mono text-sm font-bold tracking-wider">{formatTime(seconds)}</span>
        </div>

        {/* Right: Leaderboard & User Points */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              loadLeaderboard();
              setShowLeaderboard(true);
            }}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <LeaderboardIcon sx={{ fontSize: 16 }} />
            <span>Leaderboard</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3 py-1.5 rounded-full shadow-xs">
            <MonetizationOnIcon sx={{ fontSize: 15 }} className="text-amber-400" />
            <span>{typeof user?.rewardPoints === 'number' ? user.rewardPoints.toLocaleString('en-IN') : '2,714'} RP</span>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. DIFFICULTY & STATS BAR
      ────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[1300px] mx-auto px-4 py-1 flex items-center justify-between shrink-0 z-10 text-xs">
        <div className="flex items-center gap-1.5">
          {(['easy', 'medium', 'hard', 'expert'] as SudokuDifficulty[]).map((lvl) => {
            const isActive = difficulty === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setDifficulty(lvl);
                  startNewGame(lvl);
                }}
                className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300 font-semibold">
          <span>
            Mistakes: <strong className="text-rose-400">{mistakes}</strong>
          </span>
          <button
            type="button"
            onClick={() => startNewGame(difficulty)}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RestartAltIcon sx={{ fontSize: 15 }} />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. MAIN STAGE: 9x9 GRID & CONTROLS (Zero Scrollbar fit on 1366x768)
      ────────────────────────────────────────────────────────── */}
      <main className="relative flex-1 w-full max-w-[1300px] mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-center gap-6 overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#040A1E]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-blue-300 tracking-wider">Generating fresh Sudoku board...</span>
          </div>
        )}

        {/* 9x9 Grid Container */}
        <div className="relative p-2.5 sm:p-3 rounded-2xl bg-[#091535] border-2 border-[#1E3A8A] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-9 gap-[1px] sm:gap-[2px] bg-[#1E3A8A] border-2 border-[#3B82F6]/60 rounded-lg overflow-hidden">
            {currentBoard.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const isInitial = initialBoard[rIdx][cIdx] !== 0;
                const isSelected = selectedCell && selectedCell[0] === rIdx && selectedCell[1] === cIdx;
                const isRelatedRowCol =
                  selectedCell && (selectedCell[0] === rIdx || selectedCell[1] === cIdx);
                const isRelatedBox =
                  selectedCell &&
                  Math.floor(selectedCell[0] / 3) === Math.floor(rIdx / 3) &&
                  Math.floor(selectedCell[1] / 3) === Math.floor(cIdx / 3);
                const isSameValue = selectedVal && selectedVal > 0 && val === selectedVal;
                const isMistake = !isInitial && val > 0 && val !== solutionBoard[rIdx][cIdx];

                // Thicker boundaries for 3x3 blocks
                const borderRight = (cIdx + 1) % 3 === 0 && cIdx < 8 ? 'border-r-2 border-r-blue-400/60' : '';
                const borderBottom = (rIdx + 1) % 3 === 0 && rIdx < 8 ? 'border-b-2 border-b-blue-400/60' : '';

                let cellBg = 'bg-[#08122B]';
                if (isSelected) {
                  cellBg = 'bg-blue-600/60 text-white ring-2 ring-cyan-400 z-10';
                } else if (isMistake) {
                  cellBg = 'bg-rose-950/80 text-rose-300';
                } else if (isSameValue) {
                  cellBg = 'bg-blue-800/50 text-cyan-200';
                } else if (isRelatedRowCol || isRelatedBox) {
                  cellBg = 'bg-[#0F224D]';
                }

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSelectedCell([rIdx, cIdx]);
                    }}
                    className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center font-bold text-sm sm:text-base md:text-lg transition-all cursor-pointer select-none ${cellBg} ${borderRight} ${borderBottom} ${
                      isInitial ? 'text-blue-200 font-black' : isMistake ? 'text-rose-400 font-extrabold' : 'text-cyan-300 font-semibold'
                    }`}
                  >
                    {val > 0 ? val : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Controls Sidebar & Number Pad */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center justify-center space-y-4">
          {/* Quick Actions (Hint & Erase) */}
          <div className="w-full flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleHint}
              disabled={!selectedCell || isCompleted}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Reveal correct number for selected cell"
            >
              <LightbulbOutlinedIcon sx={{ fontSize: 16 }} />
              <span>Hint</span>
            </button>

            <button
              type="button"
              onClick={() => handleInputNumber(0)}
              disabled={!selectedCell || isCompleted}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-40 border border-rose-400/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Erase number in selected cell"
            >
              <span>Erase</span>
            </button>
          </div>

          {/* Number Pad (1 to 9) */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleInputNumber(num)}
                disabled={isCompleted}
                className="h-12 rounded-xl bg-gradient-to-b from-[#1E3A8A] to-[#0F224D] hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 text-white font-extrabold text-lg border border-[#3B82F6]/40 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all cursor-pointer flex items-center justify-center"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Points Bonus Info */}
          <div className="w-full p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-slate-300 text-center leading-relaxed">
            <span className="text-cyan-300 font-bold">Speed Bonus:</span> Solve under 2 min for{' '}
            <strong className="text-amber-300">+5 RP bonus</strong>!
          </div>
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────
          4. VICTORY CELEBRATION MODAL
      ────────────────────────────────────────────────────────── */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-scaleUp select-none">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0F1E4C] via-[#091333] to-[#050C21] border-2 border-cyan-400/50 p-6 text-center shadow-[0_0_50px_rgba(56,189,248,0.4)] space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(251,191,36,0.8)]">
              <EmojiEventsIcon sx={{ fontSize: 34 }} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">
                SUDOKU COMPLETED!
              </h2>
              <p className="text-xs text-cyan-200 mt-1">
                You conquered the {difficulty.toUpperCase()} grid in{' '}
                <strong className="text-white">{formatTime(seconds)}</strong>!
              </p>
            </div>

            {/* Points Showcase */}
            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-400/30 shadow-inner flex items-center justify-around">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Total Points</span>
                <span className="text-2xl font-black text-amber-300">+{pointsEarned} RP</span>
              </div>
              <div className="w-[1px] h-8 bg-cyan-500/20" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Mistakes</span>
                <span className="text-2xl font-black text-rose-400">{mistakes}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => startNewGame(difficulty)}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ReplayIcon sx={{ fontSize: 18 }} />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loadLeaderboard();
                  setShowLeaderboard(true);
                }}
                className="flex-1 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <LeaderboardIcon sx={{ fontSize: 18 }} />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          5. LIVE SUDOKU LEADERBOARD MODAL
      ────────────────────────────────────────────────────────── */}
      {showLeaderboard && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none"
          onClick={() => setShowLeaderboard(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0F1E4C] via-[#091333] to-[#050C21] border border-blue-500/40 p-5 shadow-2xl text-white relative animate-scaleUp max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl text-amber-400">🏆</span>
                <h3 className="text-base sm:text-lg font-black text-white">Sudoku Top Champions</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Leaderboard Table / List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar">
              {isLoadingLeaderboard ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading rankings...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No champions on the leaderboard yet. Be the first to conquer Sudoku!
                </div>
              ) : (
                leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const rankBadge =
                    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

                  return (
                    <div
                      key={entry.user_id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm w-7 text-center text-amber-400">
                          {rankBadge}
                        </span>
                        <div>
                          <span className="font-bold text-white block text-sm">
                            {entry.username || `Player #${entry.user_id}`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {entry.total_games} games • {entry.easy_completed}E / {entry.medium_completed}M / {entry.hard_completed}H / {entry.expert_completed}X
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-amber-300 text-sm block">
                          {entry.total_points} PTS
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-blue-500/20 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowLeaderboard(false);
                  navigate('/games/leaderboard?tab=sudoku');
                }}
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Full Leaderboard Page
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboard(false)}
                className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Back to Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuGamePage;
