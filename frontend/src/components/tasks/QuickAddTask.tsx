import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks';
import { DatePicker } from '../ui/DatePicker';
import { PRIORITY_COLORS } from './PriorityIcon';

interface Props {
  projectId?: string;
  sectionId?: string;
  queryKey: string[];
  autoFocus?: boolean;
  onClose?: () => void;
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4',
};

export const QuickAddTask = ({ projectId, sectionId, queryKey, autoFocus, onClose }: Props) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) { onClose?.(); return; }

    setLoading(true);
    try {
      await tasksApi.create({
        title: trimmed, projectId, sectionId, priority,
        deadline: deadline || undefined,
      });
      setTitle('');
      setDeadline('');
      setPriority(4);
      queryClient.invalidateQueries({ queryKey });
      inputRef.current?.focus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div style={{
      borderRadius: 10,
      border: '1px solid var(--border-light)',
      background: 'var(--bg-2)',
      overflow: 'visible',
      position: 'relative',
    }}>
      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          border: `1.5px solid ${PRIORITY_COLORS[priority].color}`,
          flexShrink: 0,
        }} />
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onClose?.();
          }}
          placeholder="Название задачи"
          style={{
            flex: 1, background: 'none', border: 'none',
            color: 'var(--text)', fontSize: 14, outline: 'none',
            fontFamily: 'var(--font)',
          }}
        />
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px 10px',
        borderTop: '1px solid var(--border)',
      }}>
        {/* Дедлайн */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowDatePicker(!showDatePicker); setShowPriority(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 8px', borderRadius: 6,
              border: `1px solid ${deadline ? 'var(--border-light)' : 'var(--border)'}`,
              background: deadline ? 'var(--bg-3)' : 'none',
              cursor: 'pointer', fontSize: 12,
              color: deadline ? 'var(--text-2)' : 'var(--text-3)',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ opacity: 0.7 }}>◷</span>
            {deadlineLabel || 'Дата'}
          </button>
          {showDatePicker && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, zIndex: 100 }}>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                onClose={() => setShowDatePicker(false)}
              />
            </div>
          )}
        </div>

        {/* Приоритет */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowPriority(!showPriority); setShowDatePicker(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 8px', borderRadius: 6,
              border: `1px solid ${priority < 4 ? PRIORITY_COLORS[priority].color + '60' : 'var(--border)'}`,
              background: priority < 4 ? PRIORITY_COLORS[priority].color + '15' : 'none',
              cursor: 'pointer', fontSize: 12,
              color: priority < 4 ? PRIORITY_COLORS[priority].color : 'var(--text-3)',
              transition: 'all 0.15s',
            }}
          >
            ⚑ {PRIORITY_LABELS[priority]}
          </button>
          {showPriority && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '4px', zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              animation: 'fadeUp 0.15s ease',
            }}>
              {([1, 2, 3, 4] as const).map(p => (
                <button key={p} onClick={() => { setPriority(p); setShowPriority(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '6px 10px',
                    background: priority === p ? 'var(--bg-4)' : 'none',
                    border: 'none', borderRadius: 7, cursor: 'pointer',
                    fontSize: 13, color: PRIORITY_COLORS[p].color,
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
                  onMouseLeave={e => e.currentTarget.style.background = priority === p ? 'var(--bg-4)' : 'none'}
                >
                  ⚑ Приоритет {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {onClose && (
            <button onClick={onClose} style={{
              padding: '5px 10px', borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'none', color: 'var(--text-3)',
              cursor: 'pointer', fontSize: 12,
            }}>Отмена</button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
            style={{
              padding: '5px 12px', borderRadius: 6,
              background: title.trim() ? 'var(--accent)' : 'var(--bg-4)',
              color: title.trim() ? '#fff' : 'var(--text-3)',
              border: 'none', cursor: title.trim() ? 'pointer' : 'not-allowed',
              fontSize: 12, fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {loading ? '...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};