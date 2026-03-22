import api from './axios';
import type { Label } from '../types';

export const labelsApi = {
  getAll: () => api.get<Label[]>('/labels'),
  create: (data: { name: string; color?: string }) => api.post<Label>('/labels', data),
  update: (id: string, data: { name?: string; color?: string }) => api.patch<Label>(`/labels/${id}`, data),
  remove: (id: string) => api.delete(`/labels/${id}`),
  addToTask: (taskId: string, labelId: string) => api.post(`/tasks/${taskId}/labels/${labelId}`),
  removeFromTask: (taskId: string, labelId: string) => api.delete(`/tasks/${taskId}/labels/${labelId}`),
};