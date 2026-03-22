import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});
type F = z.infer<typeof schema>;

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--bg-3)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'var(--font)',
} as React.CSSProperties;

export const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    try { setError(''); await login(data.email, data.password); }
    catch (e: any) { setError(e.response?.data?.message || 'Неверный email или пароль'); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-up">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44,
            background: 'var(--accent)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff',
            margin: '0 auto 16px',
          }}>T</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
            Добро пожаловать
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Войдите в Taskflow
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
        }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              background: 'rgba(229,72,58,0.08)', border: '1px solid rgba(229,72,58,0.2)',
              color: 'var(--accent)', fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.02em' }}>
                EMAIL
              </label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {errors.email && <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.02em' }}>
                ПАРОЛЬ
              </label>
              <input {...register('password')} type="password" placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {errors.password && <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >Забыли пароль?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} style={{
              width: '100%', padding: '11px',
              borderRadius: 'var(--radius)',
              background: isSubmitting ? 'var(--bg-4)' : 'var(--accent)',
              color: isSubmitting ? 'var(--text-3)' : '#fff',
              border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 500,
              transition: 'all var(--transition)',
              letterSpacing: '-0.1px',
            }}>
              {isSubmitting ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >Создать</Link>
        </p>
      </div>
    </div>
  );
};