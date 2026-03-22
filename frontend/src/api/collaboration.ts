import api from './axios';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  invitedAt: string;
  acceptedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export const collaborationApi = {
  invite: (projectId: string, email: string, role?: string) =>
    api.post(`/projects/${projectId}/invite`, { email, role }),

  generateLink: (projectId: string) =>
    api.post<{ token: string; url: string }>(`/projects/${projectId}/invite-link`),

  getMembers: (projectId: string) =>
    api.get<ProjectMember[]>(`/projects/${projectId}/members`),

  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),

  updateRole: (projectId: string, userId: string, role: string) =>
    api.patch(`/projects/${projectId}/members/${userId}/role`, { role }),
};