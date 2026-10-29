// src/api/quizApi.ts
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export interface QuizPlayer {
  user_id: number;
  name: string;
  score: number;
  total_games: number;
}

export interface QuizRules {
  questionCount: number;
  secondsPerQuestion: number;
  correctPoints: number;
  wrongPenalty: number;
  timeoutPenalty: number;
}

export interface QuizSessionData {
  id: string;
  status: 'playing' | 'completed';
  index: number;
  total: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  deadline: number;
  serverNow: number;
  attempts: number[];
  selected: number | null;
  feedback: 'correct' | 'timeout' | null;
  rules: QuizRules;
  question: {
    question: string;
    options: string[];
  };
}

export interface QuizLeaderboardResponse {
  players: QuizPlayer[];
  rules: QuizRules;
}

export const fetchQuizLeaderboard = async (): Promise<QuizLeaderboardResponse> => {
  const res = await api.get(ENDPOINTS.games.quiz.leaderboard);
  return res.data?.data || res.data;
};

export const startQuizSession = async (): Promise<QuizSessionData> => {
  const res = await api.post(ENDPOINTS.games.quiz.sessions);
  return res.data?.data || res.data;
};

export const fetchQuizSession = async (id: string): Promise<QuizSessionData> => {
  const res = await api.get(ENDPOINTS.games.quiz.sessionById(id));
  return res.data?.data || res.data;
};

export const answerQuizQuestion = async (id: string, index: number, option: number): Promise<QuizSessionData> => {
  const res = await api.post(ENDPOINTS.games.quiz.answer(id), { index, option });
  return res.data?.data || res.data;
};

export const nextQuizQuestion = async (id: string, index: number): Promise<QuizSessionData> => {
  const res = await api.post(ENDPOINTS.games.quiz.next(id), { index });
  return res.data?.data || res.data;
};
