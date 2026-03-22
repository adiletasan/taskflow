import api from './axios';
import type { Project } from '../types';

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  isPublic: boolean;
  structure: {
    sections: { name: string; tasks: { title: string; priority?: number }[] }[];
    tasks: { title: string; priority?: number }[];
  };
  createdAt: string;
}

export const templatesApi = {
  getAll: () =>
    api.get<ProjectTemplate[]>('/project-templates'),

  useTemplate: (templateId: string) =>
    api.post<Project>(`/project-templates/use/${templateId}`),

  saveFromProject: (projectId: string, name: string) =>
    api.post(`/project-templates/from-project/${projectId}`, { name }),
};