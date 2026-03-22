import { useState } from 'react';
import type { Task } from '../../types';
import { tasksApi } from '../../api/tasks';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  tasks: Task[];
  projectId: string;
  queryKey: string[];
  onOpenDetail: (id: string) => void;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

export const CalendarView = ({ tasks, projectId, queryKey, onOpenDetail }: Props) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);

  // Первый понедельник перед началом месяца
  const startDate = new Date(firstDay);
  const dow = (firstDay.getDay() + 6) % 7; // 0=Mon
  startDate.setDate(startDate.getDate() - dow);

  // Генерируем 6 недель × 7 дней
  const weeks: Date[][] = [];
  const cur = new Date(startDate);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.deadline?.startsWith(dateStr) && !t.isCompleted);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === month;

  const handleDrop = async (date: Date) => {
    if (!draggingTask) return;
    const newDeadline = date.toISOString().split('T')[0];
    await tasksApi.update(draggingTask.id, { deadline: newDeadline });
    queryClient.invalidateQueries({ queryKey });
    setDraggingTask(null);
  };

  const handleDayClick = async (date: Date) => {
    const title = prompt(`Добавить задачу на ${date.toLocaleDateString('ru-RU')}:`);
    if (!title?.trim()) return;
    const deadline = date.toISOString().split('T')[0];
    await tasksApi.create({ title: title.trim(), projectId, deadline });
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
      }}>
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
          color: 'var(--text-2)', fontSize: 14,
        }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', minWidth: 140, textAlign: 'center' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
          color: 'var(--text-2)', fontSize: 14,
        }}>→</button>
        <button onClick={() => setCurrentDate(new Date())} style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
          color: 'var(--text-3)', fontSize: 12, marginLeft: 8,
        }}>Сегодня</button>
      </div>

      {/* Calendar grid */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-3)' }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{
              padding: '8px 12px', fontSize: 11, fontWeight: 600,
              color: 'var(--text-3)', textAlign: 'center',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              borderBottom: '1px solid var(--border)',
            }}>{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {week.map((date, di) => {
              const dayTasks = getTasksForDay(date);
              const today = isToday(date);
              const inMonth = isCurrentMonth(date);

              return (
                <div
                  key={di}
                  onClick={() => handleDayClick(date)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(date)}
                  style={{
                    minHeight: 90, padding: '6px 8px',
                    borderRight: di < 6 ? '1px solid var(--border)' : 'none',
                    borderBottom: wi < 5 ? '1px solid var(--border)' : 'none',
                    background: today ? 'rgba(229,72,58,0.04)' : 'var(--bg-2)',
                    cursor: 'pointer', transition: 'background 0.1s',
                    opacity: inMonth ? 1 : 0.35,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = today ? 'rgba(229,72,58,0.08)' : 'var(--bg-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = today ? 'rgba(229,72,58,0.04)' : 'var(--bg-2)'}
                >
                  {/* Day number */}
                  <div style={{
                    fontSize: 12, fontWeight: today ? 700 : 400,
                    color: today ? 'var(--accent)' : 'var(--text-3)',
                    marginBottom: 4,
                    width: 22, height: 22,
                    borderRadius: '50%',
                    background: today ? 'var(--accent-dim)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {date.getDate()}
                  </div>

                  {/* Tasks */}
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => { e.stopPropagation(); setDraggingTask(task); }}
                      onClick={e => { e.stopPropagation(); onOpenDetail(task.id); }}
                      style={{
                        fontSize: 11, padding: '2px 5px',
                        borderRadius: 4, marginBottom: 2,
                        background: 'var(--bg-4)',
                        color: 'var(--text-2)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        cursor: 'grab', transition: 'background 0.1s',
                        borderLeft: `2px solid ${task.priority === 1 ? 'var(--p1)' : task.priority === 2 ? 'var(--p2)' : task.priority === 3 ? 'var(--p3)' : 'var(--border)'}`,
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--text-3)', paddingLeft: 5 }}>
                      +{dayTasks.length - 3} ещё
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};