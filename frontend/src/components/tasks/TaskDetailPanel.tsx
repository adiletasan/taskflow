import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks';
import { PriorityIcon, PRIORITY_COLORS } from './PriorityIcon';
import { labelsApi } from '../../api/labels';
import { LabelSelector } from './LabelSelector';
import { TaskComments } from './TaskComments';
import { TaskActivityLog } from './TaskActivityLog';

interface Props {
  taskId: string | null;
  onClose: () => void;
}

const PRIORITIES = [
  { value: 1, label: 'P1' },
  { value: 2, label: 'P2' },
  { value: 3, label: 'P3' },
  { value: 4, label: 'P4' },
];

type Tab = 'details' | 'comments' | 'activity';

export const TaskDetailPanel = ({ taskId, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1|2|3|4>(4);
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('details');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getOne(taskId!).then(r => r.data),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority as 1|2|3|4);
      setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    }
  }, [task]);

  const handleSave = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      await tasksApi.update(taskId, {
        title, description, priority,
        deadline: deadline || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!taskId) return;
    await tasksApi.duplicateTask(taskId);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    onClose();
  };

  if (!taskId) return null;

  const TABS: { value: Tab; label: string }[] = [
    { value: 'details',  label: 'Детали' },
    { value: 'comments', label: 'Комментарии' },
    { value: 'activity', label: 'История' },
  ];

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)', zIndex: 40,
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 420, background: 'var(--bg-2)',
        borderLeft: '1px solid var(--border)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.2s ease',
      }}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)} style={{
                padding: '5px 10px', borderRadius: 7,
                border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: tab === t.value ? 600 : 400,
                background: tab === t.value ? 'var(--bg-4)' : 'none',
                color: tab === t.value ? 'var(--text)' : 'var(--text-3)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleDuplicate} title="Дублировать" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 14, padding: 4, borderRadius: 6,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >⎘</button>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 18, padding: 4, borderRadius: 6,
              lineHeight: 1,
            }}>×</button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 24, height: 24,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
            }} className="animate-spin-slow" />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

            {/* ── Details Tab ── */}
            {tab === 'details' && (
              <>
                {/* Title */}
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={handleSave}
                  rows={2}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    color: 'var(--text)', fontSize: 17, fontWeight: 600,
                    fontFamily: 'var(--font)', outline: 'none', resize: 'none',
                    lineHeight: 1.4, letterSpacing: '-0.3px', marginBottom: 12,
                  }}
                />

                {/* Description */}
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Добавить описание..."
                  style={{
                    width: '100%', background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 12px',
                    color: 'var(--text)', fontSize: 13,
                    fontFamily: 'var(--font)', outline: 'none', resize: 'none',
                    lineHeight: 1.5, marginBottom: 16,
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; handleSave(); }}
                />

                {/* Priority */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'block', marginBottom: 7,
                  }}>Приоритет</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {PRIORITIES.map(p => (
                      <button key={p.value}
                        onClick={() => { setPriority(p.value as any); setTimeout(handleSave, 0); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 6,
                          border: `1px solid ${priority === p.value ? PRIORITY_COLORS[p.value as 1|2|3|4].color : 'var(--border)'}`,
                          background: priority === p.value ? `${PRIORITY_COLORS[p.value as 1|2|3|4].color}18` : 'var(--bg-3)',
                          cursor: 'pointer', fontSize: 12, color: 'var(--text-2)',
                          transition: 'all 0.15s',
                        }}>
                        <PriorityIcon priority={p.value as 1|2|3|4} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'block', marginBottom: 7,
                  }}>Дедлайн</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    onBlur={handleSave}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-3)', color: 'var(--text)',
                      fontSize: 13, outline: 'none',
                      fontFamily: 'var(--font)', colorScheme: 'dark',
                    }}
                  />
                </div>

                {/* Labels */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'block', marginBottom: 7,
                  }}>Метки</label>
                  <LabelSelector
                    selectedLabels={task?.labels || []}
                    onAdd={async (labelId) => {
                      await labelsApi.addToTask(taskId!, labelId);
                      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
                      queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    }}
                    onRemove={async (labelId) => {
                      await labelsApi.removeFromTask(taskId!, labelId);
                      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
                      queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    }}
                  />
                </div>

                {/* Subtasks */}
                {task?.subtasks && task.subtasks.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      display: 'block', marginBottom: 7,
                    }}>
                      Подзадачи ({task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length})
                    </label>
                    {task.subtasks.map(sub => (
                      <div key={sub.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 0', borderBottom: '1px solid var(--border)',
                      }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: '1.5px solid var(--border-light)',
                          background: sub.isCompleted ? 'var(--accent)' : 'transparent',
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: 13, color: 'var(--text-2)',
                          textDecoration: sub.isCompleted ? 'line-through' : 'none',
                        }}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Comments Tab ── */}
            {tab === 'comments' && <TaskComments taskId={taskId!} />}

            {/* ── Activity Tab ── */}
            {tab === 'activity' && <TaskActivityLog taskId={taskId!} />}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: '7px 14px', borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'none', color: 'var(--text-2)',
            cursor: 'pointer', fontSize: 13,
          }}>Закрыть</button>
          {tab === 'details' && (
            <button onClick={handleSave} disabled={saving} style={{
              padding: '7px 14px', borderRadius: 7,
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};