import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { setAccessToken } from '../api/axios';

type ThemeOption = 'light' | 'dark' | 'system';

const THEMES: { value: ThemeOption; label: string; icon: string; desc: string }[] = [
  { value: 'light',  label: 'Светлая',   icon: '☀',  desc: 'Белый фон' },
  { value: 'dark',   label: 'Тёмная',    icon: '◑',  desc: 'Тёмный фон' },
  { value: 'system', label: 'Системная', icon: '⊙',  desc: 'Авто' },
];

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/users/me', { name: name.trim() });
      setUser({ ...user!, name: data.name });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {}
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Минимум 8 символов');
      return;
    }
    setSavingPassword(true);
    setPasswordError('');
    try {
      await api.patch('/users/me/password', { oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (e: any) {
      setPasswordError(e.response?.data?.message || 'Ошибка смены пароля');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'удалить') return;
    try {
      await api.delete('/users/me');
      setAccessToken(null);
      queryClient.clear();
      navigate('/login');
    } catch {}
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--bg-3)', color: 'var(--text)',
    fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
    transition: 'border-color 0.15s',
  } as React.CSSProperties;

  const sectionStyle = {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 16,
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: 11, fontWeight: 600,
    color: 'var(--text-3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    display: 'block', marginBottom: 10,
  };

  return (
    <div className="animate-fade-up">
      <div style={{ padding: '24px 28px 0' }}>
        <h1 style={{
          fontSize: 22, fontWeight: 600,
          color: 'var(--text)', letterSpacing: '-0.5px',
          marginBottom: 4,
        }}>Настройки</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>
          Управление аккаунтом и оформлением
        </p>
      </div>

      <div style={{ padding: '0 28px', maxWidth: 560 }}>

        {/* ── Профиль ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Профиль</label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{user?.email}</p>
              <p style={{
                fontSize: 11, color: user?.plan === 'pro' ? '#f59e0b' : 'var(--text-3)',
                marginTop: 2, fontWeight: 500,
              }}>
                {user?.plan === 'pro' ? '✦ Pro план' : 'Free план'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, marginBottom: 6 }}>Имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button onClick={handleSaveProfile} disabled={savingProfile} style={{
            padding: '8px 16px', borderRadius: 8,
            background: profileSaved ? '#10b981' : 'var(--accent)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'background 0.3s',
          }}>
            {profileSaved ? '✓ Сохранено' : savingProfile ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>

        {/* ── Тема ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Оформление</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {THEMES.map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)} style={{
                flex: 1, padding: '12px 8px',
                borderRadius: 10,
                border: `1px solid ${theme === t.value ? 'var(--accent)' : 'var(--border)'}`,
                background: theme === t.value ? 'var(--accent-dim)' : 'var(--bg-3)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: theme === t.value ? 'var(--accent)' : 'var(--text-2)',
                }}>{t.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Пароль ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Смена пароля</label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Текущий пароль"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Новый пароль (мин. 8 символов)"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {passwordError && (
            <p style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 10 }}>
              {passwordError}
            </p>
          )}

          <button onClick={handleChangePassword} disabled={savingPassword} style={{
            padding: '8px 16px', borderRadius: 8,
            background: passwordSaved ? '#10b981' : 'var(--bg-4)',
            color: passwordSaved ? '#fff' : 'var(--text-2)',
            border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.3s',
          }}>
            {passwordSaved ? '✓ Пароль изменён' : savingPassword ? 'Меняем...' : 'Изменить пароль'}
          </button>
        </div>

        {/* ── Данные ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Данные</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={async () => {
                const { data } = await api.get('/users/me');
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'taskflow-data.json'; a.click();
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text-2)',
                transition: 'background 0.15s', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>↓</span> Экспортировать данные
            </button>
          </div>
        </div>

        {/* ── Опасная зона ── */}
        <div style={{
          ...sectionStyle,
          border: '1px solid rgba(229,72,58,0.2)',
          background: 'rgba(229,72,58,0.03)',
        }}>
          <label style={{ ...labelStyle, color: 'var(--accent)' }}>Опасная зона</label>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 8,
              border: '1px solid rgba(229,72,58,0.3)',
              background: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--accent)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>✕</span> Удалить аккаунт
            </button>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
                Это действие необратимо. Введи{' '}
                <code style={{
                  background: 'var(--bg-4)', padding: '1px 6px',
                  borderRadius: 4, fontSize: 12, color: 'var(--accent)',
                }}>удалить</code>{' '}
                для подтверждения.
              </p>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="удалить"
                style={{ ...inputStyle, marginBottom: 10 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'удалить'}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: deleteConfirmText === 'удалить' ? 'var(--accent)' : 'var(--bg-4)',
                    color: deleteConfirmText === 'удалить' ? '#fff' : 'var(--text-3)',
                    border: 'none',
                    cursor: deleteConfirmText === 'удалить' ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 500,
                  }}
                >
                  Удалить навсегда
                </button>
                <button onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }} style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'none', color: 'var(--text-2)',
                  cursor: 'pointer', fontSize: 13,
                }}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};