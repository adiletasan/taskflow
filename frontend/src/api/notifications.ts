import api from './axios';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () =>
    api.get<AppNotification[]>('/notifications'),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),

  remove: (id: string) =>
    api.delete(`/notifications/${id}`),

  clearAll: () =>
    api.delete('/notifications'),
};