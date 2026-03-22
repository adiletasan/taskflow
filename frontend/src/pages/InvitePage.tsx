import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    api.get(`/auth/invite/${token}/accept`)
      .then(r => {
        setStatus('success');
        setTimeout(() => navigate(`/app/project/${r.data.projectId}`), 2000);
      })
      .catch(() => setStatus('error'));
  }, [token, isAuthenticated]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }} className="animate-fade-up">
        {status === 'loading' && (
          <>
            <div style={{
              width: 40, height: 40,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }} className="animate-spin-slow" />
            <p style={{ fontSize: 15, color: 'var(--text-2)' }}>Принимаем приглашение...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 16px',
            }}>✓</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              Добро пожаловать!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
              Ты успешно присоединился к проекту. Перенаправляем...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid rgba(229,72,58,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 16px',
            }}>✕</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              Ссылка недействительна
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
              Приглашение истекло или было отозвано
            </p>
            <button onClick={() => navigate('/app')} style={{
              padding: '9px 20px', borderRadius: 9,
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  );
};