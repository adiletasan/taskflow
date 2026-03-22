import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../api/auth';

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Пароли не совпадают', path: ['confirmPassword'] });

type F = z.infer<typeof schema>;

const inputStyle = {
  width: '100%', padding: '10px 14px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--bg-3)',
  color: 'var(--text)', fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'var(--font)',
} as React.CSSProperties;

const fields = [
  { name: 'name',            label: 'ИМЯ',            type: 'text',     placeholder: 'Иван Иванов' },
  { name: 'email',           label: 'EMAIL',          type: 'email',    placeholder: 'you@example.com' },
  { name: 'password',        label: 'ПАРОЛЬ',         type: 'password', placeholder: '••••••••' },
  { name: 'confirmPassword', label: 'ПОВТОРИТЕ ПАРОЛЬ', type: 'password', placeholder: '••••••••' },
] as const;

export const RegisterPage = () => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    try {
      setServerError('');
      await authApi.register({ name: data.name, email: data.email, password: data.password });
      setSuccess(true);
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Ошибка регистрации');
    }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }} className="animate-fade-up">
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Проверь почту</h2>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>Отправили письмо с подтверждением</p>
        <Link to="/login" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>← Войти</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, background: 'var(--accent)', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 auto 16px',
          }}>T</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>Создать аккаунт</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Присоединяйтесь к Taskflow</p>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px' }}>
          {serverError && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius)', background: 'rgba(229,72,58,0.08)', border: '1px solid rgba(229,72,58,0.2)', color: 'var(--accent)', fontSize: 13, marginBottom: 16 }}>
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((f, i) => (
              <div key={f.name} style={{ marginBottom: i < fields.length - 1 ? 14 : 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.02em' }}>
                  {f.label}
                </label>
                <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                {errors[f.name] && <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>{errors[f.name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={isSubmitting} style={{
              width: '100%', padding: '11px',
              borderRadius: 'var(--radius)',
              background: isSubmitting ? 'var(--bg-4)' : 'var(--accent)',
              color: isSubmitting ? 'var(--text-3)' : '#fff',
              border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 500, transition: 'all var(--transition)',
            }}>
              {isSubmitting ? 'Создаём...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >Войти</Link>
        </p>
      </div>
    </div>
  );
};