import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/layout/Header';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';
import { FilterPanel } from '../components/tasks/FilterPanel';
import type { FilterState } from '../components/tasks/FilterPanel';

const QUERY_KEY = ['tasks', 'all'];

type SortKey = 'createdAt' | 'deadline' | 'priority' | 'title';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'createdAt', label: 'Дата добавления' },
  { value: 'deadline',  label: 'Дедлайн' },
  { value: 'priority',  label: 'Приоритет' },
  { value: 'title',     label: 'Алфавит' },
];

export const AllTasksPage = () => {
  const { user } = useAuthStore();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priority: null, labelId: null, deadline: null,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => tasksApi.getAll().then(r => r.data),
    enabled: !!user,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = useMemo(() => {
    let result = tasks.filter(t => !t.isCompleted);

    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }

    if (filters.labelId) {
      result = result.filter(t => t.labels?.some(l => l.id === filters.labelId));
    }

    if (filters.deadline === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result = result.filter(t => t.deadline &&
        new Date(t.deadline) >= today && new Date(t.deadline) < tomorrow);
    } else if (filters.deadline === 'overdue') {
      result = result.filter(t => t.deadline && new Date(t.deadline) < today);
    } else if (filters.deadline === 'week') {
      const in7 = new Date(today);
      in7.setDate(in7.getDate() + 7);
      result = result.filter(t => t.deadline &&
        new Date(t.deadline) >= today && new Date(t.deadline) < in7);
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'priority') return a.priority - b.priority;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filters, sortBy]);

  const hasFilters = filters.priority || filters.labelId || filters.deadline;

  return (
    <div className="animate-fade-up">
      <Header title="Все задачи" subtitle={`${filtered.length} задач`} />

      <div style={{ padding: '20px 28px', maxWidth: 680 }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        }}>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            style={{
              padding: '6px 10px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-3)', color: 'var(--text-2)',
              fontSize: 12, outline: 'none', cursor: 'pointer',
            }}
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Filter toggle */}
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 10px', borderRadius: 8,
            border: `1px solid ${hasFilters ? 'var(--accent)' : 'var(--border)'}`,
            background: hasFilters ? 'var(--accent-dim)' : 'none',
            cursor: 'pointer', fontSize: 12,
            color: hasFilters ? 'var(--accent)' : 'var(--text-3)',
            transition: 'all 0.15s',
          }}>
            ⊟ Фильтры {hasFilters ? '•' : ''}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({ priority: null, labelId: null, deadline: null })}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 36, borderRadius: 8, background: 'var(--bg-3)', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        )}

        {/* Tasks */}
        {!isLoading && filtered.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            queryKey={QUERY_KEY}
            onOpenDetail={setDetailId}
          />
        ))}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '56px 0', gap: 10,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 4,
            }}>⊟</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)' }}>
              {hasFilters ? 'Нет задач по фильтрам' : 'Нет задач'}
            </p>
          </div>
        )}
      </div>

      <TaskDetailPanel taskId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
};