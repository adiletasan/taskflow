import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/layout/Header';
import { TaskItem } from '../components/tasks/TaskItem';
import { QuickAddTask } from '../components/tasks/QuickAddTask';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';

const QUERY_KEY = ['tasks', 'inbox'];

export const InboxPage = () => {
  const { user } = useAuthStore();
  const [showAdd, setShowAdd] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => tasksApi.getAll({ projectId: undefined }).then(r => r.data),
    enabled: !!user,
  });

  // Хоткей Q — открыть быстрое добавление
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'q' && !e.ctrlKey && !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)) {
        setShowAdd(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="animate-fade-up">
      <Header title="Входящие" subtitle={today} />

      <div style={{ padding: '20px 28px', maxWidth: 680 }}>

        {/* Quick add button */}
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px',
              borderRadius: 8, border: '1px dashed var(--border)',
              background: 'none', cursor: 'pointer',
              marginBottom: 20, transition: 'border-color 0.15s, background 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.background = 'var(--bg-2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: 16, lineHeight: 1 }}>+</span>
            <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>
              Добавить задачу
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-3)', opacity: 0.5,
              background: 'var(--bg-3)',
              padding: '2px 6px', borderRadius: 4,
              border: '1px solid var(--border)',
            }}>Q</span>
          </button>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <QuickAddTask
              queryKey={QUERY_KEY}
              autoFocus
              onClose={() => setShowAdd(false)}
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 36, borderRadius: 8,
                background: 'var(--bg-3)',
                opacity: 1 - i * 0.2,
                animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        )}

        {/* Active tasks */}
        {!isLoading && activeTasks.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                queryKey={QUERY_KEY}
                onOpenDetail={setDetailId}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && activeTasks.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '56px 0', gap: 10,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 4,
            }}>✓</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)' }}>
              Входящие пусты
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Отличная работа — все задачи выполнены
            </p>
          </div>
        )}

        {/* Completed tasks */}
        {!isLoading && completedTasks.length > 0 && (
          <details style={{ marginTop: 8 }}>
            <summary style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              cursor: 'pointer', userSelect: 'none',
              padding: '6px 12px', listStyle: 'none',
            }}>
              Выполнено · {completedTasks.length}
            </summary>
            <div style={{ marginTop: 6, opacity: 0.5 }}>
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  queryKey={QUERY_KEY}
                  onOpenDetail={setDetailId}
                />
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        taskId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
};