import api from './axios';
import type { Task } from '../types';

export const searchApi = {
  search: (q: string) => api.get<Task[]>('/tasks/search', { params: { q } }),
};