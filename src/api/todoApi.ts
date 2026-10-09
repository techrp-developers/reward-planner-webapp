// src/api/todoApi.ts
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export interface TodoItem {
  id: string;
  createdBy?: number;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  time?: string;
  title: string;
  subtitle?: string;
  reminder?: string | null;
  completed: boolean;
  status?: string;
  icon?: any;
}

export interface TodoPayload {
  task_date: string;
  start_time: string;
  end_time: string;
  title: string;
  subtitle?: string;
  reminder_time?: string | null;
}

export interface TodoApiResponse {
  success: boolean;
  count?: number;
  data?: TodoItem[];
  message?: string;
  todoId?: number;
}

export const todoApi = {
  async getTodos(date?: string, filter?: 'ALL' | 'PENDING' | 'COMPLETED'): Promise<TodoItem[]> {
    try {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      if (filter && filter !== 'ALL') params.filter = filter;

      const response = await api.get<TodoApiResponse>(ENDPOINTS.todo.list, { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch todos from API:', error);
      return [];
    }
  },

  async createTodo(payload: TodoPayload): Promise<TodoApiResponse> {
    const response = await api.post<TodoApiResponse>(ENDPOINTS.todo.create, payload);
    return response.data;
  },

  async updateTodo(id: string | number, payload: Partial<TodoPayload>): Promise<TodoApiResponse> {
    const response = await api.put<TodoApiResponse>(ENDPOINTS.todo.update(id), payload);
    return response.data;
  },

  async completeTodo(id: string | number): Promise<TodoApiResponse> {
    const response = await api.patch<TodoApiResponse>(ENDPOINTS.todo.complete(id));
    return response.data;
  },

  async deleteTodo(id: string | number): Promise<TodoApiResponse> {
    const response = await api.delete<TodoApiResponse>(ENDPOINTS.todo.delete(id));
    return response.data;
  },
};
