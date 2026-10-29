// src/api/sudokuApi.ts
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuStartResponse {
  success: boolean;
  game_id: number;
  board: number[][]; // 9x9 board with 0 for empty cells
  solution: number[][]; // 9x9 solved board
}

export interface SudokuCompletePayload {
  game_id: number;
  completion_time: number; // in seconds
  username: string;
}

export interface SudokuCompleteResponse {
  success: boolean;
  message: string;
  points_earned: number;
}

export interface SudokuLeaderboardEntry {
  user_id: number;
  username: string;
  total_points: number;
  total_games: number;
  easy_completed: number;
  medium_completed: number;
  hard_completed: number;
  expert_completed: number;
}

export interface SudokuLeaderboardResponse {
  success: boolean;
  leaderboard: SudokuLeaderboardEntry[];
}

/**
 * Start a new Sudoku game on the backend.
 * Returns game_id, 9x9 initial board, and 9x9 solution.
 */
export const startSudokuGame = async (
  difficulty: SudokuDifficulty = 'easy'
): Promise<SudokuStartResponse> => {
  const res = await api.post(ENDPOINTS.games.sudoku.start, { difficulty });
  return res.data;
};

/**
 * Complete a Sudoku game on the backend.
 * Awards base points + speed bonus, updates leaderboard, and notifies user.
 */
export const completeSudokuGame = async (
  payload: SudokuCompletePayload
): Promise<SudokuCompleteResponse> => {
  const res = await api.post(ENDPOINTS.games.sudoku.complete, payload);
  return res.data;
};

/**
 * Fetch top 10 players from the Sudoku leaderboard.
 */
export const fetchSudokuLeaderboard = async (): Promise<SudokuLeaderboardResponse> => {
  const res = await api.get(ENDPOINTS.games.sudoku.leaderboard);
  return res.data;
};
