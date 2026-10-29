// src/services/gamesLeaderboardService.ts
// Synchronized, reactive game score and leaderboard persistence service for Quivio Quiz & Sudoku Challenge
import { QuizPlayer } from '../api/quizApi';
import { SudokuLeaderboardEntry } from '../api/sudokuApi';

const STORAGE_KEYS = {
  QUIZ_USER_STATS: 'rp_quiz_user_stats',
  QUIZ_DYNAMIC_LEADERBOARD: 'rp_quiz_dynamic_leaderboard',
  SUDOKU_USER_STATS: 'rp_sudoku_user_stats',
  SUDOKU_DYNAMIC_LEADERBOARD: 'rp_sudoku_dynamic_leaderboard',
};

export const QUIZ_LEADERBOARD_CHANGED_EVENT = 'rp_quiz_leaderboard_changed';
export const SUDOKU_LEADERBOARD_CHANGED_EVENT = 'rp_sudoku_leaderboard_changed';

export interface QuizUserStats {
  score: number;
  bestScore: number;
  totalGames: number;
  lastPlayed: number;
}

export interface SudokuUserStats {
  totalPoints: number;
  totalGames: number;
  lastPlayed: number;
}

// Initial reference data for Quivio Quiz
export const DEFAULT_QUIZ_PLAYERS: QuizPlayer[] = [
  { user_id: 37, name: 'Sakshi Chavan', score: 10, total_games: 5 },
  { user_id: 102, name: 'Prajesh kumar', score: 10, total_games: 4 },
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

// Initial reference data for Sudoku Challenge
export const DEFAULT_SUDOKU_PLAYERS: SudokuLeaderboardEntry[] = [
  { user_id: 37, username: 'Sakshi Chavan', total_points: 130, total_games: 16, easy_completed: 9, medium_completed: 5, hard_completed: 2, expert_completed: 0 },
  { user_id: 201, username: 'Harshali Chavan', total_points: 125, total_games: 15, easy_completed: 8, medium_completed: 5, hard_completed: 2, expert_completed: 0 },
  { user_id: 202, username: 'Shrinivas Karur', total_points: 110, total_games: 12, easy_completed: 6, medium_completed: 4, hard_completed: 2, expert_completed: 0 },
  { user_id: 203, username: 'Sahil Mujawar', total_points: 95, total_games: 10, easy_completed: 5, medium_completed: 3, hard_completed: 2, expert_completed: 0 },
  { user_id: 204, username: 'Geeta', total_points: 80, total_games: 8, easy_completed: 4, medium_completed: 3, hard_completed: 1, expert_completed: 0 },
  { user_id: 205, username: 'Sandhya Jadhav', total_points: 65, total_games: 7, easy_completed: 4, medium_completed: 2, hard_completed: 1, expert_completed: 0 },
];

/**
 * Checks if a player matches the given identifiers
 */
export const isPlayerMatch = (
  player: { user_id?: number | string; name?: string; username?: string },
  playerName?: string,
  userId?: number | string
): boolean => {
  if (userId && player.user_id && String(player.user_id) === String(userId)) {
    return true;
  }
  const targetName = (playerName || '').trim().toLowerCase();
  if (!targetName) return false;
  const pName = (player.name || player.username || '').trim().toLowerCase();
  return pName === targetName;
};

/**
 * Retrieves the stored Quiz stats for the current player
 */
export const getStoredQuizUserStats = (): QuizUserStats | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_USER_STATS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Records a completed Quiz Game score, updating the player's stats and dynamic leaderboard
 */
export const recordQuizGameScore = (
  playerName: string,
  userId: number | string | undefined,
  score: number
): { rank: number; score: number; bestScore: number; totalGames: number } => {
  const cleanName = (playerName || 'You').trim();
  const validUserId = userId ? Number(userId) : 37;

  // 1. Update personal stats
  const prevStats = getStoredQuizUserStats();
  const totalGames = (prevStats?.totalGames || 0) + 1;
  const bestScore = Math.max(prevStats?.bestScore || 0, score);
  const currentStats: QuizUserStats = {
    score,
    bestScore,
    totalGames,
    lastPlayed: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_USER_STATS, JSON.stringify(currentStats));
  } catch (e) {
    console.warn('Could not save quiz stats to localStorage:', e);
  }

  // 2. Load existing dynamic leaderboard
  let players: QuizPlayer[] = [];
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.QUIZ_DYNAMIC_LEADERBOARD);
    if (cached) {
      players = JSON.parse(cached);
    }
  } catch {}

  if (!Array.isArray(players) || players.length === 0) {
    players = [...DEFAULT_QUIZ_PLAYERS];
  }

  // 3. Find and update player in the list
  const idx = players.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
  if (idx !== -1) {
    players[idx] = {
      ...players[idx],
      name: cleanName,
      user_id: validUserId,
      score, // Dynamically updates according to this quiz game score!
      total_games: totalGames,
    };
  } else {
    players.push({
      user_id: validUserId,
      name: cleanName,
      score,
      total_games: totalGames,
    });
  }

  // 4. Re-sort by score DESC, then total_games DESC, then alphabetical
  players.sort((a, b) => b.score - a.score || b.total_games - a.total_games || a.name.localeCompare(b.name));

  // 5. Save back to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_DYNAMIC_LEADERBOARD, JSON.stringify(players));
  } catch (e) {
    console.warn('Could not save dynamic leaderboard:', e);
  }

  // 6. Find player's new rank (1-indexed)
  const newRankIdx = players.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
  const rank = newRankIdx !== -1 ? newRankIdx + 1 : 1;

  // 7. Dispatch event for instant UI reactive update across tabs/components
  try {
    window.dispatchEvent(
      new CustomEvent(QUIZ_LEADERBOARD_CHANGED_EVENT, {
        detail: { rank, score, bestScore, totalGames, players },
      })
    );
  } catch {}

  return { rank, score, bestScore, totalGames };
};

/**
 * Returns the merged dynamic Quiz leaderboard, combining backend API results with live player updates
 */
export const getMergedQuizLeaderboard = (
  backendPlayers?: QuizPlayer[],
  playerName?: string,
  userId?: number | string
): QuizPlayer[] => {
  const cleanName = (playerName || 'You').trim();
  const validUserId = userId ? Number(userId) : 37;
  const userStats = getStoredQuizUserStats();

  let list: QuizPlayer[] = [];

  // If backend provided players, start from backend
  if (Array.isArray(backendPlayers) && backendPlayers.length > 0) {
    list = backendPlayers.map((p) => ({ ...p }));
  } else {
    // Check localStorage cached dynamic leaderboard
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.QUIZ_DYNAMIC_LEADERBOARD);
      if (cached) {
        list = JSON.parse(cached);
      }
    } catch {}
    if (!Array.isArray(list) || list.length === 0) {
      list = DEFAULT_QUIZ_PLAYERS.map((p) => ({ ...p }));
    }
  }

  // Ensure current user's latest quiz score and games are merged
  if (userStats) {
    const idx = list.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        score: userStats.score, // Dynamically changes according to quiz game score
        total_games: Math.max(list[idx].total_games || 0, userStats.totalGames),
      };
    } else {
      list.push({
        user_id: validUserId,
        name: cleanName,
        score: userStats.score,
        total_games: userStats.totalGames,
      });
    }
  }

  // Sort descending: highest score first
  list.sort((a, b) => b.score - a.score || b.total_games - a.total_games || a.name.localeCompare(b.name));

  return list;
};

/**
 * Returns current user's dynamic Quiz rank, score, and total games
 */
export const getDynamicQuizUserStats = (
  leaderboard: QuizPlayer[],
  playerName?: string,
  userId?: number | string
): { rank: number; score: number; bestScore: number; totalGames: number } => {
  const cleanName = (playerName || 'You').trim();
  const validUserId = userId ? Number(userId) : 37;
  const stored = getStoredQuizUserStats();

  const idx = leaderboard.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
  if (idx !== -1) {
    const player = leaderboard[idx];
    return {
      rank: idx + 1,
      score: player.score,
      bestScore: stored?.bestScore || player.score,
      totalGames: player.total_games,
    };
  }

  if (stored) {
    return {
      rank: 1,
      score: stored.score,
      bestScore: stored.bestScore,
      totalGames: stored.totalGames,
    };
  }

  return { rank: 1, score: 10, bestScore: 10, totalGames: 5 };
};

/**
 * Records a completed Sudoku Game score, updating the player's stats and dynamic leaderboard
 */
export const recordSudokuGameScore = (
  username: string,
  userId: number | string | undefined,
  pointsEarned: number
): { rank: number; totalPoints: number; totalGames: number } => {
  const cleanName = (username || 'You').trim();
  const validUserId = userId ? Number(userId) : 37;

  let list: SudokuLeaderboardEntry[] = [];
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.SUDOKU_DYNAMIC_LEADERBOARD);
    if (cached) list = JSON.parse(cached);
  } catch {}

  if (!Array.isArray(list) || list.length === 0) {
    list = DEFAULT_SUDOKU_PLAYERS.map((p) => ({ ...p }));
  }

  const idx = list.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
  let totalPoints = pointsEarned;
  let totalGames = 1;

  if (idx !== -1) {
    totalPoints = (list[idx].total_points || 0) + pointsEarned;
    totalGames = (list[idx].total_games || 0) + 1;
    list[idx] = {
      ...list[idx],
      total_points: totalPoints,
      total_games: totalGames,
      easy_completed: (list[idx].easy_completed || 0) + 1,
    };
  } else {
    list.push({
      user_id: validUserId,
      username: cleanName,
      total_points: totalPoints,
      total_games: totalGames,
      easy_completed: 1,
      medium_completed: 0,
      hard_completed: 0,
      expert_completed: 0,
    });
  }

  list.sort((a, b) => b.total_points - a.total_points || b.total_games - a.total_games);

  try {
    localStorage.setItem(STORAGE_KEYS.SUDOKU_DYNAMIC_LEADERBOARD, JSON.stringify(list));
    localStorage.setItem(
      STORAGE_KEYS.SUDOKU_USER_STATS,
      JSON.stringify({ totalPoints, totalGames, lastPlayed: Date.now() })
    );
  } catch {}

  const newRankIdx = list.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
  const rank = newRankIdx !== -1 ? newRankIdx + 1 : 1;

  try {
    window.dispatchEvent(
      new CustomEvent(SUDOKU_LEADERBOARD_CHANGED_EVENT, {
        detail: { rank, totalPoints, totalGames, players: list },
      })
    );
  } catch {}

  return { rank, totalPoints, totalGames };
};

/**
 * Returns the merged dynamic Sudoku leaderboard
 */
export const getMergedSudokuLeaderboard = (
  backendLeaderboard?: SudokuLeaderboardEntry[],
  username?: string,
  userId?: number | string
): SudokuLeaderboardEntry[] => {
  const cleanName = (username || 'You').trim();
  const validUserId = userId ? Number(userId) : 37;

  let list: SudokuLeaderboardEntry[] = [];
  if (Array.isArray(backendLeaderboard) && backendLeaderboard.length > 0) {
    list = backendLeaderboard.map((p) => ({ ...p }));
  } else {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SUDOKU_DYNAMIC_LEADERBOARD);
      if (cached) list = JSON.parse(cached);
    } catch {}
    if (!Array.isArray(list) || list.length === 0) {
      list = DEFAULT_SUDOKU_PLAYERS.map((p) => ({ ...p }));
    }
  }

  try {
    const rawStats = localStorage.getItem(STORAGE_KEYS.SUDOKU_USER_STATS);
    if (rawStats) {
      const stats = JSON.parse(rawStats);
      const idx = list.findIndex((p) => isPlayerMatch(p, cleanName, validUserId));
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          total_points: Math.max(list[idx].total_points, stats.totalPoints),
          total_games: Math.max(list[idx].total_games, stats.totalGames),
        };
      }
    }
  } catch {}

  list.sort((a, b) => b.total_points - a.total_points || b.total_games - a.total_games);
  return list;
};
