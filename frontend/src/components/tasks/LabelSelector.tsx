import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '../../api/labels';
import { LabelBadge } from '../ui/LabelBadge';
import type { Label } from '../../types';

const PRESET_COLORS = [
  '#e5483a', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

interface Props {
  selectedLabels: Label[];
  onAdd: (labelId: string) => void;
  onRemove: (labelId: string) => void;
}

export const LabelSelector = ({ selectedLabels, onAdd, onRemove }: Props) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[3]);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: allLabels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: () => labelsApi.getAll().then(r => r.data),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { data } = await labelsApi.create({ name: newName.trim(), color: newColor });
    queryClient.invalidateQueries({ queryKey: ['labels'] });
    onAdd(data.id);
    setNewName('');
    setCreating(false);
  };

  const isSelected = (id: string) => selectedLabels.some(l => l.id === id);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Selected labels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {selectedLabels.map(label => (
          <LabelBadge
            key={label.id}
            label={label}
            onRemove={() => onRemove(label.id)}
          />
        ))}
        <button onClick={() => setOpen(!open)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 99,
          border: '1px dashed var(--border-light)',
          background: 'none', cursor: 'pointer',
          fontSize: 11, color: 'var(--text-3)',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
        >
          + Метка
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '6px',
          minWidth: 200, maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.15s ease',
        }}>
          {allLabels.length === 0 && !creating && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', padding: '6px 8px' }}>
              Нет меток
            </p>
          )}

          {allLabels.map(label => (
            <button key={label.id} onClick={() => isSelected(label.id) ? onRemove(label.id) : onAdd(label.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '6px 8px', borderRadius: 7,
                background: isSelected(label.id) ? 'var(--bg-4)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
              onMouseLeave={e => e.currentTarget.style.background = isSelected(label.id) ? 'var(--bg-4)' : 'none'}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: label.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{label.name}</span>
              {isSelected(label.id) && <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

          {!creating ? (
            <button onClick={() => setCreating(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', padding: '6px 8px', borderRadius: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-3)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>+</span> Создать метку
            </button>
          ) : (
            <div style={{ padding: '6px 4px' }}>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="Название метки"
                style={{
                  width: '100%', padding: '5px 8px', marginBottom: 6,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-4)', color: 'var(--text)',
                  fontSize: 12, outline: 'none', fontFamily: 'var(--font)',
                }}
              />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: c, border: 'none', cursor: 'pointer',
                    outline: newColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={handleCreate} style={{
                  flex: 1, padding: '4px', borderRadius: 6,
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 11,
                }}>Создать</button>
                <button onClick={() => setCreating(false)} style={{
                  padding: '4px 8px', borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'none', color: 'var(--text-3)',
                  cursor: 'pointer', fontSize: 11,
                }}>Отмена</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};