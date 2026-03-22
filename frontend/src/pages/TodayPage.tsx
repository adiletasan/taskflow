import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/layout/Header';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';

const QUERY_KEY = ['tasks', 'today'];

export const TodayPage = () => {
  const { user } = useAuthStore();
  const [detailId, setDetailId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => tasksApi.getToday().then(r => r.data),
    enabled: !!user,
  });

  const overdue = tasks.filter(t =>
    t.deadline && new Date(t.deadline) < new Date(new Date().setHours(0, 0, 0, 0))
  );
  const todayTasks = tasks.filter(t =>
    t.deadline && new Date(t.deadline) >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  return (
    <div className="animate-fade-up">
      <Header title="Сегодня" subtitle={today} />

      <div style={{ padding: '20px 28px', maxWidth: 680 }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 36, borderRadius: 8, background: 'var(--bg-3)', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        )}

        {/* Просроченные */}
        {overdue.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: 6 }}>
              Просрочено · {overdue.length}
            </div>
            {overdue.map(task => (
              <TaskItem key={task.id} task={task} queryKey={QUERY_KEY} onOpenDetail={setDetailId} />
            ))}
          </div>
        )}

        {/* Сегодня */}
        {todayTasks.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: 6 }}>
              Сегодня · {todayTasks.length}
            </div>
            {todayTasks.map(task => (
              <TaskItem key={task.id} task={task} queryKey={QUERY_KEY} onOpenDetail={setDetailId} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && tasks.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 0', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 4 }}>◈</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)' }}>На сегодня задач нет</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Добавь задачи с дедлайном на сегодня</p>
          </div>
        )}
      </div>

      <TaskDetailPanel taskId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
};