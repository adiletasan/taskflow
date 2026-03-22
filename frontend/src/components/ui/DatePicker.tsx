import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (date: string) => void;
  onClose?: () => void;
}

const QUICK = [
  {
    label: 'Сегодня',
    icon: '◈',
    getValue: () => new Date().toISOString().split('T')[0],
  },
  {
    label: 'Завтра',
    icon: '→',
    getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    },
  },
  {
    label: 'На следующей неделе',
    icon: '◷',
    getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    },
  },
];

export const DatePicker = ({ value, onChange, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short',
    });
  };

  return (
    <div ref={ref} style={{
      background: 'var(--bg-3)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '12px',
      width: 220,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'fadeUp 0.15s ease',
    }}>
      {/* Быстрые кнопки */}
      <div style={{ marginBottom: 10 }}>
        {QUICK.map(q => (
          <button key={q.label} onClick={() => { onChange(q.getValue()); onClose?.(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '6px 8px',
              background: value === q.getValue() ? 'var(--bg-4)' : 'none',
              border: 'none', borderRadius: 7, cursor: 'pointer',
              fontSize: 13, color: 'var(--text-2)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
            onMouseLeave={e => e.currentTarget.style.background = value === q.getValue() ? 'var(--bg-4)' : 'none'}
          >
            <span style={{ fontSize: 12, opacity: 0.6, width: 14 }}>{q.icon}</span>
            <span>{q.label}</span>
            {value === q.getValue() && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)' }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Разделитель */}
      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

      {/* Нативный date input */}
      <div>
        <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
          Выбрать дату
        </label>
        <input
          type="date"
          value={value}
          onChange={e => { onChange(e.target.value); onClose?.(); }}
          style={{
            width: '100%', padding: '7px 10px',
            borderRadius: 7, border: '1px solid var(--border)',
            background: 'var(--bg-4)', color: 'var(--text)',
            fontSize: 13, outline: 'none',
            fontFamily: 'var(--font)', colorScheme: 'dark',
          }}
        />
      </div>

      {/* Очистить */}
      {value && (
        <>
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          <button onClick={() => { onChange(''); onClose?.(); }} style={{
            width: '100%', padding: '6px', borderRadius: 7,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--accent)',
            transition: 'background 0.1s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Очистить дату
          </button>
        </>
      )}
    </div>
  );
};