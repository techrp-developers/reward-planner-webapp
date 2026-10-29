// src/modules/games/GamesHomePage.tsx
// Complete Neon Gaming Dashboard Module matching the exact reference design
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Material-UI Icons
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Assets
import gamesNewBanner from '../../assets/games/gamesnewbanner.png';
import gameLayoutBg from '../../assets/games/gamelayout.png';
import artQuizClean from '../../assets/games/art_quiz_clean.png';
import artSudokuClean from '../../assets/games/art_sudoku_clean.png';
import artCardsClean from '../../assets/games/art_cards_clean.png';
import artMemoryClean from '../../assets/games/art_memory_clean.png';

interface GameCardData {
  id: 'quiz' | 'sudoku' | 'cards' | 'memory';
  tag: string;
  tagColor: string;
  tagBg: string;
  tagBorder: string;
  title: string;
  description: string;
  illustration: string;
  cardBg: string;
  borderColor: string;
  glowColor: string;
  buttonBg: string;
  buttonText: string;
  isAvailable: boolean;
}

const FEATURED_GAMES: GameCardData[] = [
  {
    id: 'quiz',
    tag: 'TRIVIA',
    tagColor: 'text-[#F3E8FF]',
    tagBg: 'bg-[#9333EA]/30',
    tagBorder: 'border-[#A855F7]/40',
    title: 'Quiz',
    description: 'Test your knowledge and earn RP Points!',
    illustration: artQuizClean,
    cardBg: 'bg-gradient-to-b from-[#1C0E38] via-[#14082B] to-[#0D041C]',
    borderColor: 'border-[#4C1D95]/40',
    glowColor: 'hover:shadow-[0_12px_36px_rgba(168,85,247,0.22)] hover:border-[#A855F7]/50',
    buttonBg: 'bg-[#A7F3D0] hover:bg-[#86EFAC] text-[#064E3B] shadow-[0_4px_16px_rgba(110,231,183,0.35)]',
    buttonText: 'Play Now',
    isAvailable: true,
  },
  {
    id: 'sudoku',
    tag: 'PUZZLE',
    tagColor: 'text-[#DBEAFE]',
    tagBg: 'bg-[#2563EB]/30',
    tagBorder: 'border-[#3B82F6]/40',
    title: 'Sudoku',
    description: 'Challenge your logic with 9x9 puzzles and earn RP Points!',
    illustration: artSudokuClean,
    cardBg: 'bg-gradient-to-b from-[#0F1E4C] via-[#091333] to-[#050C21]',
    borderColor: 'border-[#1E3A8A]/40',
    glowColor: 'hover:shadow-[0_12px_36px_rgba(59,130,246,0.22)] hover:border-[#3B82F6]/50',
    buttonBg: 'bg-[#93C5FD] hover:bg-[#60A5FA] text-[#0F172A] font-bold shadow-[0_4px_16px_rgba(147,197,253,0.35)]',
    buttonText: 'Play Now',
    isAvailable: true,
  },
  {
    id: 'cards',
    tag: 'CARD GAME',
    tagColor: 'text-[#FFE4E6]',
    tagBg: 'bg-[#E11D48]/30',
    tagBorder: 'border-[#F43F5E]/40',
    title: 'Cards Royale',
    description: 'A fast and fun card challenge!',
    illustration: artCardsClean,
    cardBg: 'bg-gradient-to-b from-[#3E0F1D] via-[#2A0812] to-[#170409]',
    borderColor: 'border-[#881337]/40',
    glowColor: 'hover:shadow-[0_12px_36px_rgba(244,63,94,0.22)] hover:border-[#F43F5E]/50',
    buttonBg: 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md',
    buttonText: 'Upcoming',
    isAvailable: false,
  },
  {
    id: 'memory',
    tag: 'MEMORY',
    tagColor: 'text-[#CCFBF1]',
    tagBg: 'bg-[#0D9488]/30',
    tagBorder: 'border-[#14B8A6]/40',
    title: 'Memory Match',
    description: 'Flip, match and remember. Test your memory skills.',
    illustration: artMemoryClean,
    cardBg: 'bg-gradient-to-b from-[#082E33] via-[#051E22] to-[#031316]',
    borderColor: 'border-[#0F766E]/40',
    glowColor: 'hover:shadow-[0_12px_36px_rgba(20,184,166,0.22)] hover:border-[#14B8A6]/50',
    buttonBg: 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md',
    buttonText: 'Upcoming',
    isAvailable: false,
  },
];

export const GamesHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<'quiz' | 'sudoku' | 'cards' | 'memory' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyName =
    user?.company?.name ||
    user?.company_name ||
    (typeof user?.company === 'string' ? user?.company : '') ||
    'MPS Global';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Remove vertical scrollbar across all browsers in the Game Module
  useEffect(() => {
    document.documentElement.classList.add('in-games-module', 'no-scrollbar', 'games-layout');
    document.body.classList.add('in-games-module', 'no-scrollbar', 'games-layout');

    return () => {
      document.documentElement.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
      document.body.classList.remove('in-games-module', 'no-scrollbar', 'games-layout');
    };
  }, []);

  // ── QUIZ STATE ──
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const QUIZ_QUESTIONS = [
    {
      q: 'Which cognitive skill is most improved by playing puzzle and logic games?',
      options: ['Problem Solving', 'Typing Speed', 'Hearing Pitch', 'Sleep Duration'],
      answer: 0,
    },
    {
      q: 'How many Reward Planner points do you typically get for completing daily mini-games?',
      options: ['10 RP', '25 RP', '50 RP Bonus', '100 RP Jackpot'],
      answer: 2,
    },
    {
      q: 'Taking a 5-minute gaming break during work hours has been proven to:',
      options: ['Decrease eyesight', 'Refresh mental focus', 'Slow down emails', 'Increase fatigue'],
      answer: 1,
    },
  ];

  const handleSelectQuizOption = (idx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    if (idx === QUIZ_QUESTIONS[quizIndex].answer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizSelected(null);
    } else {
      setQuizFinished(true);
      showToast(`🎉 Quiz completed! You scored ${quizScore + (quizSelected === QUIZ_QUESTIONS[quizIndex].answer ? 1 : 0)}/3. +50 RP Points awarded!`);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizFinished(false);
  };

  // ── CARDS ROYALE STATE (High-Low Showdown) ──
  const [cardScore, setCardScore] = useState(0);
  const [currentCardValue, setCurrentCardValue] = useState(7);
  const [nextCardValue, setNextCardValue] = useState<number | null>(null);
  const [cardMessage, setCardMessage] = useState('Will the next card be Higher or Lower?');

  const CARD_NAMES: { [key: number]: string } = {
    1: 'Ace (1)',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'Jack (11)',
    12: 'Queen (12)',
    13: 'King (13)',
  };

  const handleCardGuess = (guess: 'higher' | 'lower') => {
    const nextVal = Math.floor(Math.random() * 13) + 1;
    setNextCardValue(nextVal);

    const isHigher = nextVal >= currentCardValue;
    const won = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

    if (won) {
      setCardScore((s) => s + 1);
      setCardMessage(`✨ Correct! Card was ${CARD_NAMES[nextVal]}. Streak: ${cardScore + 1}`);
      setTimeout(() => {
        setCurrentCardValue(nextVal);
        setNextCardValue(null);
      }, 1200);
    } else {
      setCardMessage(`❌ Oops! Card was ${CARD_NAMES[nextVal]}. Play again!`);
      setTimeout(() => {
        setCurrentCardValue(nextVal);
        setNextCardValue(null);
        setCardScore(0);
      }, 1500);
    }
  };

  // ── MEMORY MATCH STATE (Flip Cards) ──
  interface MemoryCard {
    id: number;
    icon: string;
    label: string;
    flipped: boolean;
    matched: boolean;
  }

  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>(() => initMemoryCards());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [memoryWon, setMemoryWon] = useState(false);

  function initMemoryCards(): MemoryCard[] {
    const pairs = [
      { icon: '⭐', label: 'Star' },
      { icon: '♠️', label: 'Spade' },
      { icon: '🎮', label: 'Game' },
      { icon: '💎', label: 'Gem' },
      { icon: '🏆', label: 'Trophy' },
      { icon: '🎁', label: 'Gift' },
    ];
    const deck = [...pairs, ...pairs]
      .map((item, idx) => ({
        id: idx,
        icon: item.icon,
        label: item.label,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5);
    return deck;
  }

  const handleFlipCard = (id: number) => {
    if (flippedIds.length >= 2) return;
    const target = memoryCards.find((c) => c.id === id);
    if (!target || target.flipped || target.matched) return;

    const nextCards = memoryCards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setMemoryCards(nextCards);

    const nextFlipped = [...flippedIds, id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      const card1 = nextCards.find((c) => c.id === nextFlipped[0])!;
      const card2 = nextCards.find((c) => c.id === nextFlipped[1])!;

      if (card1.label === card2.label) {
        setTimeout(() => {
          const matchedDeck = nextCards.map((c) =>
            c.id === card1.id || c.id === card2.id ? { ...c, matched: true } : c
          );
          setMemoryCards(matchedDeck);
          setFlippedIds([]);
          if (matchedDeck.every((c) => c.matched)) {
            setMemoryWon(true);
            showToast('🎉 All pairs matched! +100 RP Points added to your wallet!');
          }
        }, 600);
      } else {
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) => (c.id === card1.id || c.id === card2.id ? { ...c, flipped: false } : c))
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  const resetMemory = () => {
    setMemoryCards(initMemoryCards());
    setFlippedIds([]);
    setMemoryWon(false);
  };

  // ── SUDOKU STATE (Interactive 4x4 Mini-Grid) ──
  const [sudokuGrid, setSudokuGrid] = useState<number[]>([
    1, 2, 0, 4,
    0, 4, 1, 0,
    4, 0, 2, 1,
    2, 1, 0, 0,
  ]);
  const sudokuSolution = [
    1, 2, 3, 4,
    3, 4, 1, 2,
    4, 3, 2, 1,
    2, 1, 4, 3,
  ];
  const [sudokuSelectedCell, setSudokuSelectedCell] = useState<number | null>(null);
  const [sudokuWon, setSudokuWon] = useState(false);

  const handleSudokuInput = (num: number) => {
    if (sudokuSelectedCell === null) return;
    const initialFixed = [0, 1, 3, 5, 6, 8, 10, 11, 12, 13];
    if (initialFixed.includes(sudokuSelectedCell)) return;

    const nextGrid = [...sudokuGrid];
    nextGrid[sudokuSelectedCell] = num;
    setSudokuGrid(nextGrid);

    if (nextGrid.every((val, idx) => val === sudokuSolution[idx])) {
      setSudokuWon(true);
      showToast('🧩 Sudoku solved perfectly! +75 RP Points earned!');
    }
  };

  return (
    <div className="min-h-screen bg-[#020F28] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#7C3AED] selection:text-white relative overflow-x-hidden pb-12 games-layout no-scrollbar">
      
      {/* Background Layout Artwork from gamelayout.png anchored at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 w-full overflow-hidden z-0 select-none flex justify-center">
        <img
          src={gameLayoutBg}
          alt=""
          className="w-full min-w-[1280px] h-auto object-cover object-bottom opacity-95"
          draggable={false}
        />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C0E28] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-[#9333EA]/30 backdrop-blur-md">
          <AutoAwesomeIcon sx={{ fontSize: 18 }} className="text-amber-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* Top Navigation Bar in Full-Screen Gaming Mode */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Back"
          title="Back"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer shadow-md backdrop-blur-md group"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/games/leaderboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-200 hover:text-white bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 border border-cyan-400/30 px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-md transition-all cursor-pointer active:scale-95"
            title="View Games Leaderboard"
          >
            <EmojiEventsIcon sx={{ fontSize: 16 }} className="text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md">
            <MonetizationOnIcon sx={{ fontSize: 16 }} className="text-amber-400" />
            <span>{typeof user?.rewardPoints === 'number' ? user.rewardPoints.toLocaleString('en-IN') : '2,714'} RP Points</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* ══════════════════════════════════════════════════════════
            1. HERO BANNER: (Sleek panoramic card design)
        ══════════════════════════════════════════════════════════ */}
        <section
          className="relative w-full select-none"
          aria-label="Games Hero Banner"
        >
          <img
            src={gamesNewBanner}
            alt="Games - Take a break and play. Enjoy a collection of fun and challenging games. Play, sharpen your skills and earn RP Points while you play!"
            className="w-full h-auto object-contain block drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.002]"
            loading="eager"
            draggable={false}
          />
        </section>


        {/* ══════════════════════════════════════════════════════════
            2. FEATURED GAMES SECTION (Title + 4 Game Cards Grid)
        ══════════════════════════════════════════════════════════ */}
        <section aria-label="Featured Games">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                ★
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                  Featured Games
                </h2>
                <p className="text-xs text-[#94A3B8] leading-tight mt-0.5">
                  Handpicked games for you
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('All games are listed below on this showcase screen!')}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer group"
            >
              <span>See all</span>
              <ArrowForwardIcon sx={{ fontSize: 15 }} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 4 CARDS GRID (Quiz, Sudoku, Cards Royale, Memory Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {FEATURED_GAMES.map((game) => (
              <div
                key={game.id}
                className={`relative rounded-[24px] border ${game.borderColor} ${game.cardBg} p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1.5 ${game.glowColor} group select-none`}
              >
                {/* Top Header Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${game.tagBg} ${game.tagColor} ${game.tagBorder} shadow-xs`}
                  >
                    {game.tag}
                  </span>
                </div>

                {/* 3D Illustration Area */}
                <div className="relative w-full h-36 sm:h-40 flex items-center justify-center my-1 overflow-hidden">
                  <img
                    src={game.illustration}
                    alt={game.title}
                    className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    loading="lazy"
                    draggable={false}
                  />
                </div>

                {/* Title & Description */}
                <div className="mt-2 min-h-[70px]">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {game.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                    {game.description}
                  </p>
                </div>

                {/* Action Button: Play Now for Quiz, Upcoming for others */}
                <button
                  type="button"
                  onClick={() => {
                    if (game.id === 'quiz') {
                      navigate('/games/quiz');
                    } else if (game.id === 'sudoku') {
                      navigate('/games/sudoku');
                    } else if (game.isAvailable) {
                      setActiveModal(game.id);
                    } else {
                      showToast(`${game.title} is upcoming! Stay tuned.`);
                    }
                  }}
                  className={`w-full mt-4 py-2.5 px-4 rounded-full ${game.buttonBg} font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer`}
                >
                  <span>{game.buttonText}</span>
                  {game.isAvailable && <ArrowForwardIcon sx={{ fontSize: 14 }} />}
                </button>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════
            3. VALUE PROPOSITIONS BAR (4 Pillars)
        ══════════════════════════════════════════════════════════ */}
        <section
          className="rounded-[22px] border border-[#1E2958]/80 bg-[#0B112D]/70 backdrop-blur-md p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
          aria-label="Gaming Benefits"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {/* Pillar 1: Earn RP Points */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2A1D07] border border-[#D97706]/40 text-[#FBBF24] flex items-center justify-center shadow-[0_0_14px_rgba(245,158,11,0.2)] shrink-0">
                <EmojiEventsIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Earn RP Points
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  Play games and earn exciting Reward Planners points.
                </p>
              </div>
            </div>

            {/* Pillar 2: Sharpen Your Skills */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#200D36] border border-[#9333EA]/40 text-[#C084FC] flex items-center justify-center shadow-[0_0_14px_rgba(192,132,252,0.2)] shrink-0">
                <BarChartIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Sharpen Your Skills
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  Improve memory, logic and problem solving.
                </p>
              </div>
            </div>

            {/* Pillar 3: Fun for Everyone */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#082147] border border-[#2563EB]/40 text-[#60A5FA] flex items-center justify-center shadow-[0_0_14px_rgba(96,165,250,0.2)] shrink-0">
                <PeopleAltOutlinedIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Fun for Everyone
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  Quick games for a refreshing work break.
                </p>
              </div>
            </div>

            {/* Pillar 4: Safe & Secure */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#042824] border border-[#0D9488]/40 text-[#2DD4BF] flex items-center justify-center shadow-[0_0_14px_rgba(45,212,191,0.2)] shrink-0">
                <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Safe &amp; Secure
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  A safe and enjoyable gaming experience within {companyName}.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════
            4. SPARKLE DIVIDER & BOTTOM SECTION (Overlaid on gamelayout.png)
        ══════════════════════════════════════════════════════════ */}
        <div className="relative pt-6 pb-20 sm:pb-32 flex items-center justify-center select-none z-10">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#94A3B8] uppercase">
            <span className="text-amber-400 text-sm">✦</span>
            <span>Play</span>
            <span className="text-[#475569]">•</span>
            <span>Learn</span>
            <span className="text-[#475569]">•</span>
            <span>Earn</span>
            <span className="text-amber-400 text-sm">✦</span>
          </div>
        </div>

      </main>


      {/* ══════════════════════════════════════════════════════════
          GAMEPLAY MODAL: QUIZ (Interactive Trivia)
      ══════════════════════════════════════════════════════════ */}
      {activeModal === 'quiz' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg bg-gradient-to-b from-[#1E0E3E] to-[#0D041C] border border-[#A855F7]/40 rounded-3xl p-6 shadow-2xl text-white relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9333EA]/30 text-[#F3E8FF] border border-[#A855F7]/40">
                TRIVIA CHALLENGE
              </span>
              <span className="text-xs text-purple-300">
                Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
            </div>

            {!quizFinished ? (
              <>
                <h3 className="text-lg sm:text-xl font-bold mb-4 leading-snug">
                  {QUIZ_QUESTIONS[quizIndex].q}
                </h3>

                <div className="space-y-2.5 mb-6">
                  {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                    const isSelected = quizSelected === idx;
                    const isCorrect = idx === QUIZ_QUESTIONS[quizIndex].answer;
                    let btnClass = 'bg-white/10 hover:bg-white/15 border-white/15 text-white';

                    if (quizSelected !== null) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-600/30 border-rose-400 text-rose-200';
                      } else {
                        btnClass = 'bg-white/5 border-white/5 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={quizSelected !== null}
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSelected !== null && isCorrect && (
                          <CheckCircleIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400">
                    Score: {quizScore}
                  </span>
                  <button
                    type="button"
                    disabled={quizSelected === null}
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2 rounded-full bg-[#A7F3D0] hover:bg-[#86EFAC] disabled:opacity-40 text-[#064E3B] text-xs font-bold transition-all cursor-pointer"
                  >
                    {quizIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'Finish Quiz ✨'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto mb-3">
                  <EmojiEventsIcon sx={{ fontSize: 32 }} />
                </div>
                <h3 className="text-2xl font-bold mb-1">Trivia Completed!</h3>
                <p className="text-sm text-slate-300 mb-4">
                  You scored <strong className="text-amber-300">{quizScore}</strong> out of {QUIZ_QUESTIONS.length}!
                </p>
                <div className="inline-block bg-purple-500/20 border border-purple-500/40 rounded-2xl px-5 py-2.5 mb-6 text-sm text-purple-200 font-semibold">
                  🎁 Bonus +50 RP Points Earned!
                </div>
                <div>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="px-6 py-2.5 rounded-full bg-[#A7F3D0] hover:bg-[#86EFAC] text-[#064E3B] text-xs font-bold transition-all cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          GAMEPLAY MODAL: SUDOKU (4x4 Mini Logic Grid)
      ══════════════════════════════════════════════════════════ */}
      {activeModal === 'sudoku' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#0F1E4C] to-[#050C21] border border-[#3B82F6]/40 rounded-3xl p-6 shadow-2xl text-white relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>

            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#2563EB]/30 text-[#DBEAFE] border border-[#3B82F6]/40 mb-3 inline-block">
              LOGIC SUDOKU (4x4)
            </span>
            <h3 className="text-xl font-bold mb-1">Fill Missing Numbers (1 to 4)</h3>
            <p className="text-xs text-slate-300 mb-4">
              Tap an empty cell then tap a number below. Each row &amp; 2x2 box must contain 1–4.
            </p>

            {/* 4x4 Grid */}
            <div className="grid grid-cols-4 gap-2 max-w-[240px] mx-auto p-2 bg-[#060D24] rounded-2xl border border-blue-500/30 mb-5">
              {sudokuGrid.map((val, idx) => {
                const isSelected = sudokuSelectedCell === idx;
                const isInitial = [0, 1, 3, 5, 6, 8, 10, 11, 12, 13].includes(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSudokuSelectedCell(idx)}
                    className={`h-12 rounded-xl text-lg font-bold flex items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#60A5FA] bg-blue-600/40 text-white ring-2 ring-blue-400'
                        : isInitial
                        ? 'bg-blue-950/60 border-blue-800/40 text-blue-300 cursor-not-allowed'
                        : val > 0
                        ? 'bg-blue-500/20 border-blue-400/30 text-white'
                        : 'bg-white/5 border-white/10 text-transparent hover:bg-white/10'
                    }`}
                  >
                    {val > 0 ? val : '·'}
                  </button>
                );
              })}
            </div>

            {/* Number Selector Pad */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSudokuInput(num)}
                  className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSudokuInput(0)}
                className="w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                title="Erase"
              >
                Clear
              </button>
            </div>

            {sudokuWon && (
              <div className="text-center py-2 text-emerald-300 text-sm font-bold animate-fadeIn">
                ✨ Solved! +75 RP Points added to your account!
              </div>
            )}
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          GAMEPLAY MODAL: CARDS ROYALE (Higher or Lower)
      ══════════════════════════════════════════════════════════ */}
      {activeModal === 'cards' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#3E0F1D] to-[#170409] border border-[#F43F5E]/40 rounded-3xl p-6 shadow-2xl text-white relative animate-scaleUp text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>

            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E11D48]/30 text-[#FFE4E6] border border-[#F43F5E]/40 mb-3 inline-block">
              CARDS ROYALE SHOWDOWN
            </span>
            <h3 className="text-xl font-bold mb-1">Higher or Lower?</h3>
            <p className="text-xs text-rose-200/80 mb-5">{cardMessage}</p>

            {/* Display Current Card */}
            <div className="w-32 h-44 mx-auto rounded-2xl bg-white text-slate-900 shadow-2xl border-4 border-amber-400 flex flex-col justify-between p-3 select-none mb-6 transform hover:rotate-1 transition-transform">
              <div className="flex justify-between items-start text-rose-600 font-extrabold text-lg">
                <span>{CARD_NAMES[currentCardValue]?.split(' ')[0]}</span>
                <span>♥</span>
              </div>
              <div className="text-5xl text-rose-600 flex items-center justify-center">
                ♥
              </div>
              <div className="flex justify-between items-end text-rose-600 font-extrabold text-lg rotate-180">
                <span>{CARD_NAMES[currentCardValue]?.split(' ')[0]}</span>
                <span>♥</span>
              </div>
            </div>

            {/* Guess Buttons */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleCardGuess('higher')}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Higher ↑</span>
              </button>
              <button
                type="button"
                onClick={() => handleCardGuess('lower')}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Lower ↓</span>
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Current Winning Streak: <strong className="text-amber-400">{cardScore}</strong>
            </div>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          GAMEPLAY MODAL: MEMORY MATCH (Find Pairs)
      ══════════════════════════════════════════════════════════ */}
      {activeModal === 'memory' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#082E33] to-[#031316] border border-[#14B8A6]/40 rounded-3xl p-6 shadow-2xl text-white relative animate-scaleUp text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>

            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#0D9488]/30 text-[#CCFBF1] border border-[#14B8A6]/40 mb-3 inline-block">
              MEMORY MATCH CHALLENGE
            </span>
            <h3 className="text-xl font-bold mb-1">Flip &amp; Match Pairs</h3>
            <p className="text-xs text-teal-200/80 mb-5">
              Find all matching pairs to win RP points!
            </p>

            {/* 4x3 Cards Grid */}
            <div className="grid grid-cols-4 gap-2.5 max-w-[280px] mx-auto mb-5">
              {memoryCards.map((card) => {
                const isRevealed = card.flipped || card.matched;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleFlipCard(card.id)}
                    className={`h-16 rounded-xl text-2xl font-bold flex items-center justify-center transition-all duration-300 cursor-pointer border ${
                      card.matched
                        ? 'bg-emerald-600/30 border-emerald-400 text-white opacity-80'
                        : isRevealed
                        ? 'bg-[#14B8A6]/30 border-[#2DD4BF] text-white shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                        : 'bg-[#051E22] hover:bg-[#072B31] border-teal-800/40 text-teal-400/40 hover:text-teal-300'
                    }`}
                  >
                    {isRevealed ? card.icon : '✦'}
                  </button>
                );
              })}
            </div>

            {memoryWon ? (
              <div className="py-2 animate-fadeIn">
                <p className="text-sm text-emerald-300 font-bold mb-3">
                  🎉 Fantastic memory! All 6 pairs matched!
                </p>
                <button
                  type="button"
                  onClick={resetMemory}
                  className="px-5 py-2 rounded-full bg-[#A7F3D0] hover:bg-[#86EFAC] text-[#064E3B] text-xs font-bold transition-all cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={resetMemory}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ReplayIcon sx={{ fontSize: 14 }} />
                <span>Reset Grid</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default GamesHomePage;
