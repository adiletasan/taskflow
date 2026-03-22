import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import type { AppNotification } from '../../api/notifications';

const TYPE_ICONS: Record<string, string> = {
  task_assigned:   '👤',
  comment_mention: '💬',
  task_due_soon:   '⏰',
  project_invite:  '📨',
  task_completed:  '✓',
};

const TYPE_LABELS: Record<string, string> = {
  task_assigned:   'Задача назначена',
  comment_mention: 'Упоминание в комментарии',
  task_due_soon:   'Задача скоро истекает',
  project_invite:  'Приглашение в проект',
  task_completed:  'Задача выполнена',
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data),
    refetchInterval: 30000, // каждые 30 сек
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleClearAll = async () => {
    await notificationsApi.clearAll();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setOpen(false);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: open ? 'var(--bg-3)' : 'none',
          border: '1px solid ' + (open ? 'var(--border)' : 'transparent'),
          borderRadius: 8, cursor: 'pointer',
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: 'var(--text-2)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.background = 'var(--bg-3)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            border: '1.5px solid var(--bg-2)',
          }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'fadeUp 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Уведомления
              </span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: 'var(--accent)',
                  color: '#fff', borderRadius: 99,
                  padding: '1px 7px',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--text-3)',
                  padding: '3px 6px', borderRadius: 5,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  Прочитать все
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClearAll} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--text-3)',
                  padding: '3px 6px', borderRadius: 5,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  Очистить
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  Нет уведомлений
                </p>
              </div>
            ) : (
              notifications.map((n: AppNotification) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 16px',
                    background: n.isRead ? 'none' : 'rgba(229,72,58,0.04)',
                    borderBottom: '1px solid var(--border)',
                    cursor: n.isRead ? 'default' : 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (!n.isRead) e.currentTarget.style.background = 'rgba(229,72,58,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = n.isRead ? 'none' : 'rgba(229,72,58,0.04)';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--bg-4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                  }}>
                    {TYPE_ICONS[n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12, fontWeight: n.isRead ? 400 : 600,
                      color: 'var(--text)', marginBottom: 2,
                    }}>
                      {TYPE_LABELS[n.type] || n.type}
                    </p>
                    {n.data?.message && (
                      <p style={{
                        fontSize: 11, color: 'var(--text-3)',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {n.data.message}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {formatTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--accent)', flexShrink: 0, marginTop: 4,
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};