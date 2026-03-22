import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../api/search';
import type { Task } from '../../types';
import { PRIORITY_COLORS } from '../tasks/PriorityIcon';

interface Props {
  onClose: () => void;
}

export const CommandPalette = ({ onClose }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await searchApi.search(query);
        setResults(data);
        setSelected(0);
      } catch {}
      finally { setLoading(false); }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, results.length - 1));
    if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
    if (e.key === 'Enter' && results[selected]) {
      handleSelect(results[selected]);
    }
  };

  const handleSelect = (task: Task) => {
    if (task.projectId) navigate(`/app/project/${task.projectId}`);
    else navigate('/app/inbox');
    onClose();
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 3 }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 200,
        backdropFilter: 'blur(4px)',
      }} />

      {/* Palette */}
      <div style={{
        position: 'fixed',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 560,
        background: 'var(--bg-2)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        zIndex: 201,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.15s ease',
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          borderBottom: query ? '1px solid var(--border)' : 'none',
        }}>
          <span style={{ fontSize: 16, color: 'var(--text-3)', flexShrink: 0 }}>
            {loading ? (
              <div style={{
                width: 16, height: 16,
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
              }} className="animate-spin-slow" />
            ) : '⌕'}
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск задач..."
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--text)', fontSize: 15, outline: 'none',
              fontFamily: 'var(--font)',
            }}
          />
          <kbd style={{
            fontSize: 11, color: 'var(--text-3)',
            background: 'var(--bg-4)', border: '1px solid var(--border)',
            borderRadius: 5, padding: '2px 6px',
            fontFamily: 'var(--font-mono)',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            <div style={{ padding: '4px' }}>
              {results.map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 12px',
                    borderRadius: 8,
                    background: i === selected ? 'var(--bg-4)' : 'none',
                    border: 'none', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${PRIORITY_COLORS[task.priority as 1|2|3|4]?.color || 'var(--border)'}`,
                    background: task.isCompleted ? 'var(--accent)' : 'transparent',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13.5, color: 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                    }}>
                      {highlight(task.title, query)}
                    </p>
                    {task.deadline && (
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        ◷ {new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>↵</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {query && !loading && results.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Ничего не найдено по «{query}»</p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 16,
        }}>
          {[
            { key: '↑↓', label: 'навигация' },
            { key: '↵',  label: 'открыть' },
            { key: 'ESC', label: 'закрыть' },
          ].map(hint => (
            <div key={hint.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{
                fontSize: 10, color: 'var(--text-3)',
                background: 'var(--bg-4)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '1px 5px',
                fontFamily: 'var(--font-mono)',
              }}>{hint.key}</kbd>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};