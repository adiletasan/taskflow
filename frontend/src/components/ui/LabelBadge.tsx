import type { Label } from '../../types';

interface Props {
  label: Label;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export const LabelBadge = ({ label, onRemove, size = 'sm' }: Props) => {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      borderRadius: 99,
      background: label.color + '20',
      border: `1px solid ${label.color}40`,
      fontSize: size === 'sm' ? 11 : 12,
      color: label.color,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: label.color, flexShrink: 0,
      }} />
      {label.name}
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: label.color, padding: '0 0 0 2px', fontSize: 12,
          lineHeight: 1, opacity: 0.7,
        }}>×</button>
      )}
    </div>
  );
};