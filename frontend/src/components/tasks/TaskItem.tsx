import { useState } from 'react';
import type { Task } from '../../types';
import { PriorityIcon } from './PriorityIcon';
import { tasksApi } from '../../api/tasks';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  task: Task;
  queryKey: string[];
  onOpenDetail: (id: string) => void;
}

export const TaskItem = ({ task, queryKey, onOpenDetail }: Props) => {
  const queryClient = useQueryClient();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(task.isCompleted);

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleting(true);
    setCompleted(true);

    // Оптимистичное обновление — убираем из списка через 300мс
    setTimeout(async () => {
      try {
        await tasksApi.complete(task.id);
        queryClient.invalidateQueries({ queryKey });
      } catch {
        setCompleted(false);
      }
      setCompleting(false);
    }, 300);
  };

  const isOverdue = task.deadline && !task.isCompleted &&
    new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));

  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div
      onClick={() => onOpenDetail(task.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        opacity: completed ? 0 : 1,
        transform: completed ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 0.25s, transform 0.25s, background 0.1s',
        userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        style={{
          width: 18, height: 18, borderRadius: '50%',
          border: `1.5px solid ${task.priority === 1 ? 'var(--p1)' : task.priority === 2 ? 'var(--p2)' : task.priority === 3 ? 'var(--p3)' : 'var(--border-light)'}`,
          background: completing ? 'var(--accent)' : 'transparent',
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
          marginTop: 2,
        }}
      >
        {completing && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14,
          color: 'var(--text)',
          lineHeight: 1.4,
          textDecoration: task.isCompleted ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </p>

        {/* Meta */}
        {(deadlineText || task.subtasks?.length) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            {deadlineText && (
              <span style={{
                fontSize: 11,
                color: isOverdue ? 'var(--accent)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <span style={{ opacity: 0.7 }}>◷</span> {deadlineText}
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                ⊞ {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
              </span>
            )}
          </div>
        ) : null}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
            {task.labels.map(label => (
              <div key={label.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '1px 6px', borderRadius: 99,
                background: label.color + '20',
                border: `1px solid ${label.color}40`,
                fontSize: 10, color: label.color, fontWeight: 500,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: label.color }} />
                {label.name}
              </div>
            ))}
          </div>
        )}



      </div>

      {/* Priority */}
      <div style={{ flexShrink: 0, marginTop: 3, opacity: task.priority === 4 ? 0.3 : 1 }}>
        <PriorityIcon priority={task.priority as 1 | 2 | 3 | 4} />
      </div>
    </div>
  );
};