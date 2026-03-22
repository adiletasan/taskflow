import api from './axios';
import type { Task, TaskComment, TaskActivity } from '../types';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 1 | 2 | 3 | 4;
  deadline?: string;
  deadlineTime?: string;
  projectId?: string;
  sectionId?: string;
  parentTaskId?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  isCompleted?: boolean;
  order?: number;
}

export const tasksApi = {
  getAll: (params?: { projectId?: string; sectionId?: string; completed?: boolean }) =>
    api.get<Task[]>('/tasks', { params }),

  getOne: (id: string) =>
    api.get<Task>(`/tasks/${id}`),

  getToday: () =>
    api.get<Task[]>('/tasks/today'),

  getUpcoming: () =>
    api.get<Record<string, Task[]>>('/tasks/upcoming'),

  create: (data: CreateTaskData) =>
    api.post<Task>('/tasks', data),

  update: (id: string, data: UpdateTaskData) =>
    api.patch<Task>(`/tasks/${id}`, data),

  complete: (id: string) =>
    api.patch<Task>(`/tasks/${id}/complete`),

  reorder: (id: string, order: number) =>
    api.patch<Task>(`/tasks/${id}/reorder`, { order }),

  remove: (id: string) =>
    api.delete(`/tasks/${id}`),

  getComments: (taskId: string) =>
    api.get<TaskComment[]>(`/tasks/${taskId}/comments`),

  createComment: (taskId: string, content: string) =>
    api.post<TaskComment>(`/tasks/${taskId}/comments`, { content }),

  updateComment: (taskId: string, commentId: string, content: string) =>
    api.patch<TaskComment>(`/tasks/${taskId}/comments/${commentId}`, { content }),

  deleteComment: (taskId: string, commentId: string) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),

  getActivity: (taskId: string) =>
    api.get<TaskActivity[]>(`/tasks/${taskId}/activity`),

  duplicateTask: (taskId: string) =>
    api.post<Task>(`/tasks/${taskId}/duplicate`),

};