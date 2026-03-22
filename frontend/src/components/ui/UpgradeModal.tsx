import { useNavigate } from 'react-router-dom';

interface Props {
  feature: string;
  onClose: () => void;
}

export const UpgradeModal = ({ feature, onClose }: Props) => {
  const navigate = useNavigate();

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 100,
      }} />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 360,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '32px 28px',
        zIndex: 101, textAlign: 'center',
        animation: 'fadeUp 0.2s ease',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(229,72,58,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, margin: '0 auto 16px',
        }}>✦</div>

        <h2 style={{
          fontSize: 18, fontWeight: 700,
          color: 'var(--text)', marginBottom: 8,
          letterSpacing: '-0.3px',
        }}>
          Нужен Pro план
        </h2>

        <p style={{
          fontSize: 13, color: 'var(--text-3)',
          lineHeight: 1.6, marginBottom: 24,
        }}>
          <strong style={{ color: 'var(--text-2)' }}>{feature}</strong> доступно
          только в Pro плане. Перейди на Pro чтобы разблокировать все возможности.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px',
            borderRadius: 9, border: '1px solid var(--border)',
            background: 'none', color: 'var(--text-2)',
            cursor: 'pointer', fontSize: 13,
          }}>
            Позже
          </button>
          <button
            onClick={() => { navigate('/pricing'); onClose(); }}
            style={{
              flex: 1, padding: '10px',
              borderRadius: 9, background: 'var(--accent)',
              color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            Посмотреть Pro →
          </button>
        </div>
      </div>
    </>
  );
};