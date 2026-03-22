import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/layout/Header';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';

const QUERY_KEY = ['tasks', 'upcoming'];

const DAY_NAMES: Record<string, string> = {
  '0': 'Воскресенье', '1': 'Понедельник', '2': 'Вторник',
  '3': 'Среда', '4': 'Четверг', '5': 'Пятница', '6': 'Суббота',
};

export const UpcomingPage = () => {
  const { user } = useAuthStore();
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: grouped = {}, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => tasksApi.getUpcoming().then(r => r.data),
    enabled: !!user,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(dateStr);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return 'Сегодня';
    if (dateOnly.getTime() === tomorrow.getTime()) return 'Завтра';

    const dayName = DAY_NAMES[date.getDay().toString()];
    return `${dayName}, ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;
  };

  const dates = Object.keys(grouped).sort();
  const totalCount = Object.values(grouped).reduce((sum, tasks) => sum + tasks.length, 0);

  return (
    <div className="animate-fade-up">
      <Header
        title="Предстоящие"
        subtitle={totalCount > 0 ? `${totalCount} задач на ближайшие 7 дней` : 'Нет задач на ближайшие 7 дней'}
      />

      <div style={{ padding: '20px 28px', maxWidth: 680 }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 36, borderRadius: 8, background: 'var(--bg-3)', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        )}

        {!isLoading && dates.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '56px 0', gap: 10,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 4,
            }}>◷</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)' }}>
              Нет предстоящих задач
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Задачи с дедлайном на ближайшие 7 дней появятся здесь
            </p>
          </div>
        )}

        {dates.map((dateStr, i) => (
          <div key={dateStr} style={{
            marginBottom: 28,
            animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
          }}>
            {/* Дата */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 8,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--text-2)',
              }}>
                {formatDate(dateStr)}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{
                fontSize: 11, color: 'var(--text-3)',
                fontFamily: 'var(--font-mono)',
              }}>
                {grouped[dateStr].length}
              </span>
            </div>

            {/* Задачи */}
            {grouped[dateStr].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                queryKey={QUERY_KEY}
                onOpenDetail={setDetailId}
              />
            ))}
          </div>
        ))}
      </div>

      <TaskDetailPanel taskId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
};