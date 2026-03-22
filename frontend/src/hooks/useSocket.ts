import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export const useSocket = (projectId: string | null) => {
  const queryClient = useQueryClient();
  const projectRef = useRef(projectId);
  projectRef.current = projectId;

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !projectId) return;

    // Создаём сокет один раз
    if (!socket) {
      socket = io(
        import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000',
        { auth: { token }, transports: ['websocket'] },
      );
    }

    socket.emit('join-project', projectId);

    socket.on('task-created', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
    });

    socket.on('task-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
    });

    socket.on('task-deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
    });

    return () => {
      socket?.emit('leave-project', projectId);
      socket?.off('task-created');
      socket?.off('task-updated');
      socket?.off('task-deleted');
    };
  }, [projectId]);
};