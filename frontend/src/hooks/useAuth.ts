import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { setAccessToken } from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, logout: clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    // ← Очищаем весь кэш при входе нового пользователя
    queryClient.clear();
    navigate('/app/inbox');
  }, [navigate, setUser, queryClient]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    setAccessToken(null);
    clearUser();
    // ← Очищаем весь кэш при выходе
    queryClient.clear();
    navigate('/login');
  }, [navigate, clearUser, queryClient]);

  return { login, logout };
};