import api from './axios';
import type { Project, Section } from '../types';

export interface CreateProjectData {
  name: string;
  color?: string;
  emoji?: string;
  parentProjectId?: string;
}

export const projectsApi = {
  getAll: () =>
    api.get<Project[]>('/projects'),

  getOne: (id: string) =>
    api.get<Project>(`/projects/${id}`),

  create: (data: CreateProjectData) =>
    api.post<Project>('/projects', data),

  update: (id: string, data: Partial<CreateProjectData> & { order?: number }) =>
    api.patch<Project>(`/projects/${id}`, data),

  remove: (id: string) =>
    api.delete(`/projects/${id}`),

  // Секции
  getSections: (projectId: string) =>
    api.get<Section[]>(`/projects/${projectId}/sections`),

  createSection: (projectId: string, name: string) =>
    api.post<Section>(`/projects/${projectId}/sections`, { name }),

  updateSection: (projectId: string, sectionId: string, data: { name?: string; order?: number }) =>
    api.patch<Section>(`/projects/${projectId}/sections/${sectionId}`, data),

  removeSection: (projectId: string, sectionId: string) =>
    api.delete(`/projects/${projectId}/sections/${sectionId}`),

  getView: (projectId: string) =>
    api.get<{ view: string }>(`/projects/${projectId}/view`),

  setView: (projectId: string, view: 'list' | 'board' | 'calendar') =>
    api.patch(`/projects/${projectId}/view`, { view }),
};