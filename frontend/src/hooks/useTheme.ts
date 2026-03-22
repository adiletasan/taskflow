import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export const useTheme = () => {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (saved) setTheme(saved);
    else setTheme('dark');
  }, []);

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', t);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return { theme, setTheme };
};