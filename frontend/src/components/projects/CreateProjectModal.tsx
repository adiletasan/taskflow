import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';

const COLORS = [
  '#e5483a', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6b7280',
];

const EMOJIS = ['📋', '🚀', '💡', '🎯', '📚', '🏠', '💼', '🎨', '🛒', '⚙️', '🌱', '❤️'];

interface Props {
  onClose: () => void;
}

export const CreateProjectModal = ({ onClose }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[3]);
  const [emoji, setEmoji] = useState('📋');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await projectsApi.create({ name: name.trim(), color, emoji });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка создания проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100,
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        zIndex: 101,
        padding: '24px',
        animation: 'fadeUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Новый проект
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 18, padding: 4, borderRadius: 6,
          }}>×</button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(229,72,58,0.08)',
            border: '1px solid rgba(229,72,58,0.2)',
            color: 'var(--accent)', fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        {/* Preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'var(--bg-3)',
          borderRadius: 8, marginBottom: 20,
        }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: name ? 'var(--text)' : 'var(--text-3)',
          }}>
            {name || 'Название проекта'}
          </span>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: color, marginLeft: 'auto',
          }} />
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            Название
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Название проекта"
            style={{
              width: '100%', padding: '9px 12px',
              borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-3)', color: 'var(--text)',
              fontSize: 14, outline: 'none', fontFamily: 'var(--font)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Emoji */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            Иконка
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid ${emoji === e ? 'var(--border-light)' : 'var(--border)'}`,
                background: emoji === e ? 'var(--bg-4)' : 'var(--bg-3)',
                cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            Цвет
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 24, height: 24, borderRadius: '50%',
                background: c, border: 'none', cursor: 'pointer',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s',
              }} />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'none', color: 'var(--text-2)',
            cursor: 'pointer', fontSize: 13,
          }}>Отмена</button>
          <button onClick={handleCreate} disabled={!name.trim() || loading} style={{
            padding: '8px 16px', borderRadius: 8,
            background: name.trim() ? 'var(--accent)' : 'var(--bg-4)',
            color: name.trim() ? '#fff' : 'var(--text-3)',
            border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 500,
            transition: 'all 0.15s',
          }}>
            {loading ? 'Создаём...' : 'Создать'}
          </button>
        </div>
      </div>
    </>
  );
};