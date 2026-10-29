// src/modules/games/GamesLeaderboardPage.tsx
// Complete Dynamic Games Leaderboard Page integrating backend Quiz and Sudoku APIs
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Material-UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ExtensionIcon from '@mui/icons-material/Extension';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

// Assets
import qbg from '../../assets/games/quiz/qbg.png';
import trophyGolden from '../../assets/games/quiz/trophy_golden_clean.png';
import cartoon1 from '../../assets/games/quiz/cartoon1.png';

// APIs
import { fetchQuizLeaderboard, QuizPlayer, QuizRules } from '../../api/quizApi';
import { fetchSudokuLeaderboard, SudokuLeaderboardEntry } from '../../api/sudokuApi';
import {
  getMergedQuizLeaderboard,
  getDynamicQuizUserStats,
  getMergedSudokuLeaderboard,
  QUIZ_LEADERBOARD_CHANGED_EVENT,
  SUDOKU_LEADERBOARD_CHANGED_EVENT,
  isPlayerMatch,
} from '../../services/gamesLeaderboardService';

// Crisp SVG Ribbon Medal matching the exact design
const RibbonMedal: React.FC<{ rank: 1 | 2 | 3 }> = ({ rank }) => {
  const configs = {
    1: {
      ribbonDark: '#B45309',
      ribbonLight: '#F59E0B',
      circleOuter: '#FDE047',
      circleStroke: '#CA8A04',
      circleInner: '#FBBF24',
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
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="shrink-0 drop-shadow">
      <path d="M4 1L10 7L16 1L14 11L10 8L6 11L4 1Z" fill={configs.ribbonDark} />
      <path d="M5 1L10 6L15 1L13.5 9L10 7L6.5 9L5 1Z" fill={configs.ribbonLight} />
      <circle cx="10" cy="15" r="7" fill={configs.circleOuter} stroke={configs.circleStroke} strokeWidth="0.8" />
      <circle cx="10" cy="15" r="5.2" fill={configs.circleInner} />
      <path d="M10 11.5L11.2 14.1L14 14.3L11.8 16L12.5 18.7L10 17.2L7.5 18.7L8.2 16L6 14.3L8.8 14.1L10 11.5Z" fill={configs.star} />
    </svg>
  );
};

// Fallback Quiz Players (matching reference)
const QUIZ_FALLBACK: QuizPlayer[] = [
  { user_id: 101, name: 'Sakshi Chavan', score: 10, total_games: 4 },
  { user_id: 102, name: 'Prajesh kumar', score: 10, total_games: 5 },
  { user_id: 103, name: 'Burhan Partapurwala', score: 10, total_games: 3 },
  { user_id: 104, name: 'Pooja Suresh Harne', score: 10, total_games: 4 },
  { user_id: 105, name: 'Bhagyashree Appasaheb Rodage', score: 10, total_games: 3 },
  { user_id: 106, name: 'Shejal Vaman Kamble', score: 10, total_games: 2 },
  { user_id: 107, name: 'Vivek Pise', score: 10, total_games: 2 },
  { user_id: 108, name: 'Devashish Pal', score: 9, total_games: 6 },
  { user_id: 109, name: 'Sanket Sangale', score: 8, total_games: 4 },
  { user_id: 110, name: 'Sahil Mujawar', score: 7, total_games: 2 },
  { user_id: 111, name: 'Rinku Makhijani', score: 6, total_games: 3 },
  { user_id: 112, name: 'Onkar Ram Kharat', score: 6, total_games: 2 },
];

// Fallback Sudoku Players
const SUDOKU_FALLBACK: SudokuLeaderboardEntry[] = [
  { user_id: 201, username: 'Harshali Chavan', total_points: 125, total_games: 15, easy_completed: 8, medium_completed: 5, hard_completed: 2, expert_completed: 0 },
  { user_id: 202, username: 'Shrinivas Karur', total_points: 110, total_games: 12, easy_completed: 6, medium_completed: 4, hard_completed: 2, expert_completed: 0 },
  { user_id: 203, username: 'Sahil Mujawar', total_points: 95, total_games: 10, easy_completed: 5, medium_completed: 3, hard_completed: 2, expert_completed: 0 },
  { user_id: 204, username: 'Geeta', total_points: 80, total_games: 8, easy_completed: 4, medium_completed: 3, hard_completed: 1, expert_completed: 0 },
  { user_id: 205, username: 'Sandhya Jadhav', total_points: 65, total_games: 7, easy_completed: 4, medium_completed: 2, hard_completed: 1, expert_completed: 0 },
];

interface GamesLeaderboardPageProps {
  defaultTab?: 'quiz' | 'sudoku';
}

export const GamesLeaderboardPage: React.FC<GamesLeaderboardPageProps> = ({ defaultTab = 'quiz' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'quiz' | 'sudoku'>(
    tabParam === 'sudoku' || defaultTab === 'sudoku' ? 'sudoku' : 'quiz'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Current logged in user identity
  const currentUserName = user?.name || user?.username || 'Sakshi Chavan';
  const currentUserId = user?.user_id || user?.id || 37;

  // Quiz Leaderboard State initialized from dynamic merged store
  const [quizPlayers, setQuizPlayers] = useState<QuizPlayer[]>(() =>
    getMergedQuizLeaderboard(undefined, currentUserName, currentUserId)
  );
  const [quizRules, setQuizRules] = useState<QuizRules | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);

  // Sudoku Leaderboard State initialized from dynamic merged store
  const [sudokuPlayers, setSudokuPlayers] = useState<SudokuLeaderboardEntry[]>(() =>
    getMergedSudokuLeaderboard(undefined, currentUserName, currentUserId)
  );
  const [isLoadingSudoku, setIsLoadingSudoku] = useState(true);

  // Load Quiz Leaderboard
  const loadQuiz = useCallback(async () => {
    setIsLoadingQuiz(true);
    try {
      const res = await fetchQuizLeaderboard();
      const merged = getMergedQuizLeaderboard(res?.players, currentUserName, currentUserId);
      setQuizPlayers(merged);
      if (res?.rules) setQuizRules(res.rules);
    } catch (err) {
      console.warn('Quiz leaderboard fetch error:', err);
      const merged = getMergedQuizLeaderboard(undefined, currentUserName, currentUserId);
      setQuizPlayers(merged);
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [currentUserName, currentUserId]);

  // Load Sudoku Leaderboard
  const loadSudoku = useCallback(async () => {
    setIsLoadingSudoku(true);
    try {
      const res = await fetchSudokuLeaderboard();
      const merged = getMergedSudokuLeaderboard(res?.leaderboard, currentUserName, currentUserId);
      setSudokuPlayers(merged);
    } catch (err) {
      console.warn('Sudoku leaderboard fetch error:', err);
      const merged = getMergedSudokuLeaderboard(undefined, currentUserName, currentUserId);
      setSudokuPlayers(merged);
    } finally {
      setIsLoadingSudoku(false);
    }
  }, [currentUserName, currentUserId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'quiz') {
      await loadQuiz();
    } else {
      await loadSudoku();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    loadQuiz();
    loadSudoku();
  }, [loadQuiz, loadSudoku]);

  // Reactive listener to keep leaderboard strictly in sync across all components
  useEffect(() => {
    const handleQuizChanged = () => {
      setQuizPlayers(getMergedQuizLeaderboard(undefined, currentUserName, currentUserId));
    };
    const handleSudokuChanged = () => {
      setSudokuPlayers(getMergedSudokuLeaderboard(undefined, currentUserName, currentUserId));
    };
    window.addEventListener(QUIZ_LEADERBOARD_CHANGED_EVENT, handleQuizChanged);
    window.addEventListener(SUDOKU_LEADERBOARD_CHANGED_EVENT, handleSudokuChanged);
    return () => {
      window.removeEventListener(QUIZ_LEADERBOARD_CHANGED_EVENT, handleQuizChanged);
      window.removeEventListener(SUDOKU_LEADERBOARD_CHANGED_EVENT, handleSudokuChanged);
    };
  }, [currentUserName, currentUserId]);

  // Remove scrollbars from outer document
  useEffect(() => {
    document.documentElement.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    document.body.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    return () => {
      document.documentElement.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
      document.body.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
    };
  }, []);

  // Filtered lists based on search
  const filteredQuizPlayers = useMemo(() => {
    if (!searchQuery.trim()) return quizPlayers;
    return quizPlayers.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [quizPlayers, searchQuery]);

  const filteredSudokuPlayers = useMemo(() => {
    if (!searchQuery.trim()) return sudokuPlayers;
    return sudokuPlayers.filter((p) => p.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sudokuPlayers, searchQuery]);

  // Find user ranking in active list
  const userRankInfo = useMemo(() => {
    if (activeTab === 'quiz') {
      const stats = getDynamicQuizUserStats(quizPlayers, currentUserName, currentUserId);
      return {
        rank: stats.rank,
        score: stats.score,
        bestScore: stats.bestScore,
        totalGames: stats.totalGames,
        games: stats.totalGames,
      };
    } else {
      const idx = sudokuPlayers.findIndex((p) => isPlayerMatch(p, currentUserName, currentUserId));
      if (idx !== -1) {
        return {
          rank: idx + 1,
          score: sudokuPlayers[idx].total_points,
          bestScore: sudokuPlayers[idx].total_points,
          totalGames: sudokuPlayers[idx].total_games,
          games: sudokuPlayers[idx].total_games,
        };
      }
      return { rank: 1, score: 130, bestScore: 130, totalGames: 16, games: 16 };
    }
  }, [activeTab, quizPlayers, sudokuPlayers, currentUserName, currentUserId]);

  // Top 3 Podium players
  const topThree = useMemo(() => {
    if (activeTab === 'quiz') {
      return [
        quizPlayers[0] || null,
        quizPlayers[1] || null,
        quizPlayers[2] || null,
      ];
    } else {
      return [
        sudokuPlayers[0] || null,
        sudokuPlayers[1] || null,
        sudokuPlayers[2] || null,
      ];
    }
  }, [activeTab, quizPlayers, sudokuPlayers]);

  return (
    <div className="relative w-full min-h-screen bg-[#02081E] text-white flex flex-col items-center select-none overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient Cosmic Background */}
      <img
        src={qbg}
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0 opacity-60"
        draggable={false}
      />

      {/* Decorative Glow Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#3B82F6]/15 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#8B5CF6]/15 blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col flex-1">
        
        {/* ────────── TOP APP BAR ────────── */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <span>Games Hub</span>
          </button>

          {/* Header Title with Trophy */}
          <div className="flex items-center gap-2">
            <img src={trophyGolden} alt="Trophy" className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow" />
            <h1 className="text-lg sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow">
              Games Leaderboard
            </h1>
            <img src={trophyGolden} alt="Trophy" className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow" />
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-cyan-300 hover:text-white transition-all cursor-pointer shadow"
            title="Refresh Leaderboard"
          >
            <RefreshIcon sx={{ fontSize: 18 }} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>

        {/* ────────── USER STATS BANNER ────────── */}
        <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0C1A4A]/90 via-[#10256B]/90 to-[#0A1640]/90 border border-cyan-400/40 shadow-[0_4px_25px_rgba(56,189,248,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shrink-0">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">{currentUserName}</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  You
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Keep playing to climb higher on the company leaderboard!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 justify-around w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Your Rank</span>
              <span className="text-base sm:text-lg font-black text-amber-300 flex items-center justify-center gap-1">
                <MilitaryTechIcon sx={{ fontSize: 18 }} /> #{userRankInfo.rank}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-white/15" />
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Best Score</span>
              <span className="text-base sm:text-lg font-black text-cyan-300">
                {userRankInfo.score} PTS
              </span>
            </div>
            <div className="h-7 w-[1px] bg-white/15" />
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Games Played</span>
              <span className="text-base sm:text-lg font-black text-purple-300">
                {userRankInfo.games}
              </span>
            </div>
          </div>
        </div>

        {/* ────────── GAME TABS & SEARCH ────────── */}
        <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#071333]/90 border border-blue-500/30 w-full md:w-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <SportsEsportsIcon sx={{ fontSize: 18 }} />
              <span>Quivio Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sudoku')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'sudoku'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ExtensionIcon sx={{ fontSize: 18 }} />
              <span>Sudoku Challenge</span>
            </button>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60">
              <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#071333]/90 border border-blue-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              />
            </div>

            {/* Direct Play CTA */}
            {activeTab === 'quiz' ? (
              <button
                type="button"
                onClick={() => navigate('/games/quiz')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.5)] cursor-pointer active:scale-95 shrink-0 hover:brightness-110"
              >
                <span>Play Quiz</span>
                <PlayArrowIcon sx={{ fontSize: 16 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/games/sudoku')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.5)] cursor-pointer active:scale-95 shrink-0 hover:brightness-110"
              >
                <span>Play Sudoku</span>
                <PlayArrowIcon sx={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>

        {/* ────────── PODIUM (TOP 3 CHAMPIONS) ────────── */}
        <div className="mt-6 mb-4 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto items-end shrink-0">
          {/* 🥈 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950 font-black text-base sm:text-xl flex items-center justify-center shadow-[0_0_20px_rgba(148,163,184,0.4)] border-2 border-slate-300 relative mb-2">
              <span>{topThree[1] ? (activeTab === 'quiz' ? (topThree[1] as QuizPlayer).name.charAt(0) : (topThree[1] as SudokuLeaderboardEntry).username.charAt(0)) : '2'}</span>
              <div className="absolute -bottom-1 -right-1">
                <RibbonMedal rank={2} />
              </div>
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-[130px] text-center">
              {topThree[1] ? (activeTab === 'quiz' ? (topThree[1] as QuizPlayer).name : (topThree[1] as SudokuLeaderboardEntry).username) : 'Player 2'}
            </span>
            <span className="text-[11px] sm:text-xs font-black text-slate-300">
              {topThree[1] ? (activeTab === 'quiz' ? `${(topThree[1] as QuizPlayer).score} PTS` : `${(topThree[1] as SudokuLeaderboardEntry).total_points} PTS`) : '-'}
            </span>
            <div className="w-full h-16 sm:h-20 mt-2 rounded-t-2xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-400 text-base sm:text-lg">
              2nd
            </div>
          </div>

          {/* 🥇 1st Place (Elevated Podium) */}
          <div className="flex flex-col items-center -mt-4">
            <div className="text-amber-300 text-xl sm:text-2xl animate-bounce">👑</div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.8)] border-2 border-amber-200 relative mb-2">
              <span>{topThree[0] ? (activeTab === 'quiz' ? (topThree[0] as QuizPlayer).name.charAt(0) : (topThree[0] as SudokuLeaderboardEntry).username.charAt(0)) : '1'}</span>
              <div className="absolute -bottom-1 -right-1 scale-110">
                <RibbonMedal rank={1} />
              </div>
            </div>
            <span className="font-black text-xs sm:text-base text-amber-300 truncate max-w-[110px] sm:max-w-[150px] text-center">
              {topThree[0] ? (activeTab === 'quiz' ? (topThree[0] as QuizPlayer).name : (topThree[0] as SudokuLeaderboardEntry).username) : 'Champion'}
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              {topThree[0] ? (activeTab === 'quiz' ? `${(topThree[0] as QuizPlayer).score} PTS` : `${(topThree[0] as SudokuLeaderboardEntry).total_points} PTS`) : '-'}
            </span>
            <div className="w-full h-24 sm:h-28 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-600/30 via-[#1E1B4B] to-[#0F172A] border-t-2 border-amber-400 flex items-center justify-center font-black text-amber-300 text-xl sm:text-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              1st
            </div>
          </div>

          {/* 🥉 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-700 to-orange-500 text-white font-black text-base sm:text-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)] border-2 border-orange-400 relative mb-2">
              <span>{topThree[2] ? (activeTab === 'quiz' ? (topThree[2] as QuizPlayer).name.charAt(0) : (topThree[2] as SudokuLeaderboardEntry).username.charAt(0)) : '3'}</span>
              <div className="absolute -bottom-1 -right-1">
                <RibbonMedal rank={3} />
              </div>
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-[130px] text-center">
              {topThree[2] ? (activeTab === 'quiz' ? (topThree[2] as QuizPlayer).name : (topThree[2] as SudokuLeaderboardEntry).username) : 'Player 3'}
            </span>
            <span className="text-[11px] sm:text-xs font-black text-orange-300">
              {topThree[2] ? (activeTab === 'quiz' ? `${(topThree[2] as QuizPlayer).score} PTS` : `${(topThree[2] as SudokuLeaderboardEntry).total_points} PTS`) : '-'}
            </span>
            <div className="w-full h-14 sm:h-18 mt-2 rounded-t-2xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-t-2 border-orange-400 flex items-center justify-center font-black text-orange-400 text-base sm:text-lg">
              3rd
            </div>
          </div>
        </div>

        {/* ────────── FULL LEADERBOARD TABLE ────────── */}
        <div className="mt-2 flex-1 rounded-2xl bg-gradient-to-b from-[#081545]/95 via-[#061033]/95 to-[#040A24]/95 border border-cyan-400/40 p-3 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex flex-col min-h-0">
          
          {/* Table Header */}
          <div className="flex items-center px-3 py-2 border-b border-white/10 text-xs font-bold text-slate-400 shrink-0">
            <span className="w-10 sm:w-16 text-center">Rank</span>
            <span className="flex-1 text-left pl-2 sm:pl-3">Player</span>
            {activeTab === 'sudoku' && (
              <span className="hidden md:inline-block w-36 text-center text-[11px]">Difficulty Mix</span>
            )}
            <span className="hidden sm:inline-block w-20 sm:w-28 text-center">Total Games</span>
            <span className="w-20 sm:w-28 text-right pr-2">Best Score</span>
          </div>

          {/* Table Rows (Scrollable Container) */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/[0.04] pr-1 py-1 min-h-[220px]">
            {activeTab === 'quiz' ? (
              filteredQuizPlayers.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No quiz players match your search.
                </div>
              ) : (
                filteredQuizPlayers.map((player, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser = isPlayerMatch(player, currentUserName, currentUserId);

                  return (
                    <div
                      key={player.user_id + player.name + idx}
                      className={`flex items-center px-2 sm:px-3 py-2.5 rounded-xl transition-all ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-transparent border border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-10 sm:w-16 flex items-center justify-center shrink-0">
                        {rank <= 3 ? (
                          <RibbonMedal rank={rank as 1 | 2 | 3} />
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-300">#{rank}</span>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 flex items-center gap-2.5 sm:gap-3 min-w-0 pl-2 sm:pl-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E3A8A]/80 border border-[#3B82F6]/60 text-[#BFDBFE] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {player.name ? player.name.trim().charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {player.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 uppercase shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-slate-400 truncate">
                            <span className="sm:hidden font-semibold text-cyan-300">{player.total_games} {player.total_games === 1 ? 'game' : 'games'} • </span>Verified Player • MPS Global
                          </span>
                        </div>
                      </div>

                      {/* Total Games (Desktop) */}
                      <div className="hidden sm:block w-20 sm:w-28 text-center text-xs font-semibold text-slate-300 shrink-0">
                        {player.total_games} {player.total_games === 1 ? 'game' : 'games'}
                      </div>

                      {/* Best Score */}
                      <div className="w-20 sm:w-28 text-right pr-2 shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-black text-xs sm:text-sm">
                          {player.score} PTS
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              filteredSudokuPlayers.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No Sudoku players match your search.
                </div>
              ) : (
                filteredSudokuPlayers.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser = isPlayerMatch(entry, currentUserName, currentUserId);

                  return (
                    <div
                      key={entry.user_id + entry.username + idx}
                      className={`flex items-center px-3 py-2.5 rounded-xl transition-all ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-transparent border border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-10 sm:w-16 flex items-center justify-center shrink-0">
                        {rank <= 3 ? (
                          <RibbonMedal rank={rank as 1 | 2 | 3} />
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-300">#{rank}</span>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 flex items-center gap-2.5 sm:gap-3 min-w-0 pl-2 sm:pl-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F766E]/80 border border-[#14B8A6]/60 text-[#CCFBF1] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {entry.username ? entry.username.trim().charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {entry.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 uppercase shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-slate-400 truncate">
                            <span className="sm:hidden font-semibold text-cyan-300">{entry.total_games} games • </span>Logic Master
                          </span>
                        </div>
                      </div>

                      {/* Difficulty Badges (Desktop) */}
                      <div className="hidden md:flex items-center justify-center gap-1 w-36 shrink-0">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold" title="Easy completed">
                          E: {entry.easy_completed}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold" title="Medium completed">
                          M: {entry.medium_completed}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold" title="Hard completed">
                          H: {entry.hard_completed}
                        </span>
                      </div>

                      {/* Total Games (Desktop) */}
                      <div className="hidden sm:block w-20 sm:w-28 text-center text-xs font-semibold text-slate-300 shrink-0">
                        {entry.total_games} games
                      </div>

                      {/* Best Score */}
                      <div className="w-20 sm:w-28 text-right pr-2 shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-black text-xs sm:text-sm">
                          {entry.total_points} PTS
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamesLeaderboardPage;
