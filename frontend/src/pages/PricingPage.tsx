import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../api/billing';
import { useAuthStore } from '../store/authStore';

const FREE_FEATURES = [
  '5 проектов',
  'Неограниченные задачи',
  'Метки и фильтры',
  'Канban и Calendar виды',
  'Комментарии',
  'Базовый поиск',
];

const PRO_FEATURES = [
  'Неограниченные проекты',
  'Совместная работа',
  'Вложения файлов',
  'Приоритетная поддержка',
  'Расширенные шаблоны',
  'История активности',
  'Email напоминания',
  'Экспорт данных',
];

export const PricingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const { data } = await billingApi.createCheckout();
      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data } = await billingApi.createPortal();
      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  const isPro = user?.plan === 'pro';

  return (
    <div className="animate-fade-up" style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '60px 20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 480 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 99,
          background: 'var(--accent-dim)', border: '1px solid rgba(229,72,58,0.2)',
          fontSize: 12, color: 'var(--accent)', fontWeight: 500,
          marginBottom: 16,
        }}>
          ✦ Простое ценообразование
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-1px',
          lineHeight: 1.1, marginBottom: 12,
        }}>
          Выбери свой план
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.6 }}>
          Начни бесплатно. Переходи на Pro когда нужно больше возможностей.
        </p>
      </div>

      {/* Plans */}
      <div style={{
        display: 'flex', gap: 16,
        width: '100%', maxWidth: 720,
        alignItems: 'stretch',
      }}>
        {/* Free */}
        <div style={{
          flex: 1, padding: '28px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>
              FREE
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', letterSpacing: '-1px' }}>
                $0
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>/месяц</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
              Для личного использования
            </p>
          </div>

          <div style={{ flex: 1, marginBottom: 24 }}>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, color: '#10b981' }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/app')}
            style={{
              width: '100%', padding: '11px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'none', color: 'var(--text-2)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {!isPro ? '✓ Текущий план' : 'Базовый план'}
          </button>
        </div>

        {/* Pro */}
        <div style={{
          flex: 1, padding: '28px',
          background: 'var(--bg-2)',
          border: '1px solid var(--accent)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Popular badge */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--accent)', color: '#fff',
            fontSize: 10, fontWeight: 700,
            padding: '3px 8px', borderRadius: 99,
            letterSpacing: '0.05em',
          }}>
            POPULAR
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>
              PRO
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', letterSpacing: '-1px' }}>
                $8
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>/месяц</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
              Для команд и профессионалов
            </p>
          </div>

          <div style={{ flex: 1, marginBottom: 24 }}>
            {PRO_FEATURES.map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>✦</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
              </div>
            ))}
          </div>

          {isPro ? (
            <button onClick={handleManage} disabled={loading} style={{
              width: '100%', padding: '11px',
              borderRadius: 10, background: 'var(--bg-4)',
              color: 'var(--text-2)', border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>
              Управление подпиской
            </button>
          ) : (
            <button onClick={handleUpgrade} disabled={loading} style={{
              width: '100%', padding: '11px',
              borderRadius: 10, background: 'var(--accent)',
              color: '#fff', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500,
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}>
              {loading ? 'Загрузка...' : 'Перейти на Pro →'}
            </button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 480, width: '100%', marginTop: 48 }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
          Отмена в любое время · Безопасная оплата через Stripe · Поддержка 24/7
        </p>
      </div>
    </div>
  );
};