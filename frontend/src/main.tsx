import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import App from './App';
import './index.css';
import { setAccessToken } from './api/axios';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      // ← Данные считаются устаревшими через 5 минут
    },
  },
});

async function bootstrap() {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    setAccessToken(data.accessToken);
    useAuthStore.getState().setUser(data.user);
  } catch {
    setAccessToken(null);
    // ← При ошибке refresh очищаем кэш
    queryClient.clear();
  } finally {
    useAuthStore.getState().setLoading(false);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

bootstrap();