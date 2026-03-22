import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { NotificationBell } from '../ui/NotificationBell';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';

export const AppLayout = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuthStore();
  useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{
      display: 'flex', height: '100vh',
      overflow: 'hidden', background: 'var(--bg)',
    }}>
      <Sidebar onSearchClick={() => setShowSearch(true)} />

      <div style={{
        flex: 1, display: 'flex',
        flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{
          height: 44,
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)',
          gap: 8, flexShrink: 0,
        }}>
          <NotificationBell />

          {/* User avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#fff',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '0 0 40px',
          background: 'var(--bg)',
        }}>
          <Outlet />
        </main>
      </div>

      {showSearch && <CommandPalette onClose={() => setShowSearch(false)} />}
    </div>
  );
};