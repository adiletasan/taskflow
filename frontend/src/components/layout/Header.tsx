interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header style={{
      padding: '20px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <h1 style={{
        fontSize: 22,
        fontWeight: 600,
        color: 'var(--text)',
        letterSpacing: '-0.5px',
        lineHeight: 1.2,
      }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{subtitle}</p>
      )}
    </header>
  );
};