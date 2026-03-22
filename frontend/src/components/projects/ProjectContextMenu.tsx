import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';

interface Props {
  projectId: string;
  projectName: string;
  x: number;
  y: number;
  onClose: () => void;
  onRename: () => void;
}

export const ProjectContextMenu = ({ projectId, projectName, x, y, onClose, onRename }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    if (!confirm(`Удалить проект "${projectName}"?`)) return;
    try {
      await projectsApi.remove(projectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Ошибка удаления');
    }
    onClose();
  };

  const ITEMS = [
    { label: 'Переименовать', icon: '✎', action: () => { onRename(); onClose(); } },
    { label: 'Удалить', icon: '✕', action: handleDelete, danger: true },
  ];

  return (
    <div ref={ref} style={{
      position: 'fixed',
      top: y, left: x,
      background: 'var(--bg-3)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '4px',
      zIndex: 200,
      minWidth: 160,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.1s ease',
    }}>
      {ITEMS.map(item => (
        <button key={item.label} onClick={item.action} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '7px 10px',
          background: 'none', border: 'none',
          borderRadius: 7, cursor: 'pointer',
          fontSize: 13,
          color: item.danger ? 'var(--accent)' : 'var(--text-2)',
          transition: 'background 0.1s',
          textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ fontSize: 12, opacity: 0.7 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
};