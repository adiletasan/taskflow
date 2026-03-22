import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { templatesApi } from '../api/templates';
import type { ProjectTemplate } from '../api/templates';
import { Header } from '../components/layout/Header';

export const TemplatesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.getAll().then(r => r.data),
  });

  const handleUse = async (template: ProjectTemplate) => {
    setCreating(template.id);
    try {
      const { data: project } = await templatesApi.useTemplate(template.id);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/app/project/${project.id}`);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Ошибка создания проекта');
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <Header
        title="Шаблоны"
        subtitle="Начни с готовой структуры проекта"
      />

      <div style={{ padding: '24px 28px' }}>
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 160, borderRadius: 14,
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                opacity: 1 - i * 0.2,
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {templates.map((template, i) => (
              <div key={template.id} style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px',
                display: 'flex', flexDirection: 'column',
                gap: 12,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: (template.color || '#3b82f6') + '20',
                    border: `1px solid ${template.color || '#3b82f6'}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {template.emoji || '📋'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {template.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                      {template.structure.sections.length} секций ·{' '}
                      {template.structure.sections.reduce((sum, s) => sum + s.tasks.length, 0) +
                        template.structure.tasks.length} задач
                    </p>
                  </div>
                </div>

                {/* Description */}
                {template.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                    {template.description}
                  </p>
                )}

                {/* Sections preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {template.structure.sections.slice(0, 4).map((s, si) => (
                    <span key={si} style={{
                      fontSize: 10, padding: '2px 7px',
                      borderRadius: 99,
                      background: 'var(--bg-4)',
                      color: 'var(--text-3)',
                      border: '1px solid var(--border)',
                    }}>
                      {s.name}
                    </span>
                  ))}
                  {template.structure.sections.length > 4 && (
                    <span style={{
                      fontSize: 10, padding: '2px 7px',
                      borderRadius: 99, background: 'var(--bg-4)',
                      color: 'var(--text-3)', border: '1px solid var(--border)',
                    }}>
                      +{template.structure.sections.length - 4}
                    </span>
                  )}
                </div>

                {/* Use button */}
                <button
                  onClick={() => handleUse(template)}
                  disabled={creating === template.id}
                  style={{
                    width: '100%', padding: '9px',
                    borderRadius: 9, marginTop: 'auto',
                    background: creating === template.id ? 'var(--bg-4)' : 'var(--accent)',
                    color: creating === template.id ? 'var(--text-3)' : '#fff',
                    border: 'none', cursor: creating === template.id ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  {creating === template.id ? 'Создаём...' : 'Использовать шаблон'}
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && templates.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '56px 0', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)' }}>
              Нет шаблонов
            </p>
          </div>
        )}
      </div>
    </div>
  );
};