import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks';
import { useAuthStore } from '../../store/authStore';

interface Props {
  taskId: string;
}

export const TaskComments = ({ taskId }: Props) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => tasksApi.getComments(taskId).then(r => r.data),
    enabled: !!taskId,
  });

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await tasksApi.createComment(taskId, content.trim());
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    await tasksApi.updateComment(taskId, commentId, editContent.trim());
    queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    setEditingId(null);
  };

  const handleDelete = async (commentId: string) => {
    await tasksApi.deleteComment(taskId, commentId);
    queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <label style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'block', marginBottom: 12,
      }}>
        Комментарии {comments.length > 0 && `· ${comments.length}`}
      </label>

      {/* Comments list */}
      <div style={{ marginBottom: 16 }}>
        {comments.map(comment => (
          <div key={comment.id} style={{
            display: 'flex', gap: 10, marginBottom: 14,
          }}>
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#fff',
              flexShrink: 0, marginTop: 1,
            }}>
              {comment.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                  {comment.user?.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {formatTime(comment.createdAt)}
                </span>
                {comment.userId === user?.id && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    <button onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, color: 'var(--text-3)', padding: '1px 4px',
                      borderRadius: 4,
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >✎</button>
                    <button onClick={() => handleDelete(comment.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, color: 'var(--text-3)', padding: '1px 4px',
                      borderRadius: 4,
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >✕</button>
                  </div>
                )}
              </div>

              {/* Content */}
              {editingId === comment.id ? (
                <div>
                  <textarea
                    autoFocus
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) handleEdit(comment.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    rows={3}
                    style={{
                      width: '100%', padding: '8px 10px',
                      borderRadius: 8, border: '1px solid var(--border-light)',
                      background: 'var(--bg-3)', color: 'var(--text)',
                      fontSize: 13, outline: 'none', resize: 'none',
                      fontFamily: 'var(--font)', marginBottom: 6,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleEdit(comment.id)} style={{
                      padding: '4px 10px', borderRadius: 6,
                      background: 'var(--accent)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 11,
                    }}>Сохранить</button>
                    <button onClick={() => setEditingId(null)} style={{
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'none', color: 'var(--text-3)',
                      cursor: 'pointer', fontSize: 11,
                    }}>Отмена</button>
                  </div>
                </div>
              ) : (
                <p style={{
                  fontSize: 13, color: 'var(--text)',
                  lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  padding: '8px 10px',
                  background: 'var(--bg-3)',
                  borderRadius: 8,
                }}>
                  {comment.content}
                </p>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '8px 0' }}>
            Нет комментариев
          </p>
        )}
      </div>

      {/* New comment input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: '#fff',
          flexShrink: 0, marginTop: 1,
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) handleSend();
            }}
            placeholder="Написать комментарий... (Ctrl+Enter для отправки)"
            rows={2}
            style={{
              width: '100%', padding: '8px 10px',
              borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-3)', color: 'var(--text)',
              fontSize: 13, outline: 'none', resize: 'none',
              fontFamily: 'var(--font)', marginBottom: 6,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {content.trim() && (
            <button onClick={handleSend} disabled={sending} style={{
              padding: '5px 12px', borderRadius: 7,
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 12,
              fontWeight: 500,
            }}>
              {sending ? 'Отправляем...' : 'Отправить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};