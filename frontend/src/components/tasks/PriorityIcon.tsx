const PRIORITIES = {
  1: { color: '#e5483a', label: 'P1' },
  2: { color: '#f59e0b', label: 'P2' },
  3: { color: '#3b82f6', label: 'P3' },
  4: { color: '#4a4a52', label: 'P4' },
};

export const PriorityIcon = ({ priority }: { priority: 1 | 2 | 3 | 4 }) => {
  const p = PRIORITIES[priority];
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 12V4L7 2L12 4V8L7 12L2 12Z" fill={p.color} opacity="0.9" />
    </svg>
  );
};

export const PRIORITY_COLORS = PRIORITIES;