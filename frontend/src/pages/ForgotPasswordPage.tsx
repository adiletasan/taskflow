import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await authApi.forgotPassword(email); setSent(true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>Сброс пароля</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Пришлём ссылку на почту</p>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
                Если email существует — письмо отправлено 📬
              </p>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>← Вернуться ко входу</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.02em' }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px',
                borderRadius: 'var(--radius)',
                background: loading ? 'var(--bg-4)' : 'var(--accent)',
                color: loading ? 'var(--text-3)' : '#fff',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 500,
              }}>
                {loading ? 'Отправляем...' : 'Отправить ссылку'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >← Вернуться ко входу</Link>
        </p>
      </div>
    </div>
  );
};