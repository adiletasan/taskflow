import { useQuery } from '@tanstack/react-query';
import { labelsApi } from '../../api/labels';
import type { Label } from '../../types';

export interface FilterState {
  priority: number | null;
  labelId: string | null;
  deadline: 'today' | 'overdue' | 'week' | null;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

const PRIORITIES = [
  { value: 1, label: 'P1', color: '#e5483a' },
  { value: 2, label: 'P2', color: '#f59e0b' },
  { value: 3, label: 'P3', color: '#3b82f6' },
  { value: 4, label: 'P4', color: '#4a4a52' },
];

const DEADLINES = [
  { value: 'overdue', label: 'Просрочено' },
  { value: 'today',   label: 'Сегодня' },
  { value: 'week',    label: 'На неделе' },
];

export const FilterPanel = ({ filters, onChange, onReset }: Props) => {
  const { data: labels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: () => labelsApi.getAll().then(r => r.data),
  });

  const hasFilters = filters.priority || filters.labelId || filters.deadline;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
      padding: '10px 12px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 10, marginBottom: 16,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginRight: 4 }}>
        Фильтры:
      </span>

      {/* Priority */}
      <div style={{ display: 'flex', gap: 4 }}>
        {PRIORITIES.map(p => (
          <button key={p.value} onClick={() => onChange({
            ...filters, priority: filters.priority === p.value ? null : p.value,
          })} style={{
            padding: '3px 8px', borderRadius: 6,
            border: `1px solid ${filters.priority === p.value ? p.color : 'var(--border)'}`,
            background: filters.priority === p.value ? p.color + '20' : 'none',
            cursor: 'pointer', fontSize: 11,
            color: filters.priority === p.value ? p.color : 'var(--text-3)',
            transition: 'all 0.15s',
          }}>{p.label}</button>
        ))}
      </div>

      {/* Deadline */}
      <div style={{ display: 'flex', gap: 4 }}>
        {DEADLINES.map(d => (
          <button key={d.value} onClick={() => onChange({
            ...filters, deadline: filters.deadline === d.value ? null : d.value as any,
          })} style={{
            padding: '3px 8px', borderRadius: 6,
            border: `1px solid ${filters.deadline === d.value ? 'var(--accent)' : 'var(--border)'}`,
            background: filters.deadline === d.value ? 'var(--accent-dim)' : 'none',
            cursor: 'pointer', fontSize: 11,
            color: filters.deadline === d.value ? 'var(--accent)' : 'var(--text-3)',
            transition: 'all 0.15s',
          }}>{d.label}</button>
        ))}
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <select
          value={filters.labelId || ''}
          onChange={e => onChange({ ...filters, labelId: e.target.value || null })}
          style={{
            padding: '3px 8px', borderRadius: 6,
            border: `1px solid ${filters.labelId ? 'var(--accent)' : 'var(--border)'}`,
            background: 'var(--bg-3)', color: 'var(--text-2)',
            fontSize: 11, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Все метки</option>
          {labels.map((l: Label) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      )}

      {/* Reset */}
      {hasFilters && (
        <button onClick={onReset} style={{
          padding: '3px 8px', borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'none', cursor: 'pointer',
          fontSize: 11, color: 'var(--accent)',
          marginLeft: 'auto',
        }}>
          Сбросить ✕
        </button>
      )}
    </div>
  );
};