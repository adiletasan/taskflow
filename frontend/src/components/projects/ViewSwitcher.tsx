type View = 'list' | 'board' | 'calendar';

const VIEWS: { value: View; icon: string; label: string }[] = [
  { value: 'list',     icon: '☰',  label: 'Список' },
  { value: 'board',    icon: '⊞',  label: 'Доска' },
  { value: 'calendar', icon: '▦',  label: 'Календарь' },
];

interface Props {
  current: View;
  onChange: (view: View) => void;
}

export const ViewSwitcher = ({ current, onChange }: Props) => {
  return (
    <div style={{
      display: 'flex', gap: 2,
      background: 'var(--bg-3)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: 3,
    }}>
      {VIEWS.map(v => (
        <button key={v.value} onClick={() => onChange(v.value)}
          title={v.label}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 6,
            border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500,
            background: current === v.value ? 'var(--bg)' : 'none',
            color: current === v.value ? 'var(--text)' : 'var(--text-3)',
            boxShadow: current === v.value ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 13 }}>{v.icon}</span>
          <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
};