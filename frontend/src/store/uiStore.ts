import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  activeProjectId: string | null;
  taskDetailId: string | null;
  theme: Theme;
  setSidebarOpen: (open: boolean) => void;
  setActiveProject: (id: string | null) => void;
  setTaskDetail: (id: string | null) => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeProjectId: null,
  taskDetailId: null,
  theme: 'dark',

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveProject: (activeProjectId) => set({ activeProjectId }),
  setTaskDetail: (taskDetailId) => set({ taskDetailId }),

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  },
}));