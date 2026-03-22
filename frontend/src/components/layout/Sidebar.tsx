import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { projectsApi } from '../../api/projects';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { ProjectContextMenu } from '../projects/ProjectContextMenu';
import type { Project } from '../../types';

const NAV = [
  { to: '/app/inbox',     icon: '⬇', label: 'Входящие' },
  { to: '/app/today',     icon: '◈',  label: 'Сегодня' },
  { to: '/app/upcoming',  icon: '◷',  label: 'Предстоящие' },
  { to: '/app/tasks',     icon: '⊟',  label: 'Все задачи' },
  { to: '/app/templates', icon: '⊞',  label: 'Шаблоны' },
];

interface Props {
  onSearchClick: () => void;
}

export const Sidebar = ({ onSearchClick }: Props) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    projectId: string; projectName: string; x: number; y: number;
  } | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll().then(r => r.data),
    enabled: !!user,
  });

  const inbox = projects.find(p => p.isInbox);
  const userProjects = projects.filter(p => !p.isInbox);

  const handleRightClick = (e: React.MouseEvent, project: Project) => {
    if (project.isInbox) return;
    e.preventDefault();
    setContextMenu({ projectId: project.id, projectName: project.name, x: e.clientX, y: e.clientY });
  };

  const handleRename = async (project: Project) => {
    if (!renameValue.trim() || renameValue === project.name) { setRenamingId(null); return; }
    try {
      await projectsApi.update(project.id, { name: renameValue.trim() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch {}
    setRenamingId(null);
  };

  const startRename = (project: Project) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const navStyle = (isActive: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 10px', borderRadius: 8,
    textDecoration: 'none', fontSize: 13.5,
    fontWeight: isActive ? 500 : 400,
    color: isActive ? 'var(--text)' : 'var(--text-2)',
    background: isActive ? 'var(--bg-4)' : 'transparent',
    transition: 'all 0.15s', marginBottom: 1, cursor: 'pointer',
  });

  return (
    <>
      <aside style={{
        width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)',
        height: '100vh', background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 12px 10px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--accent)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}>T</div>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px', flex: 1 }}>
              Taskflow
            </span>
          </div>

          {/* Search button */}
          <button onClick={onSearchClick} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '7px 10px',
            borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-3)', cursor: 'pointer',
            fontSize: 13, color: 'var(--text-3)',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ fontSize: 14 }}>⌕</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Поиск...</span>
            <kbd style={{
              fontSize: 10, color: 'var(--text-3)',
              background: 'var(--bg-4)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '1px 5px',
              fontFamily: 'var(--font-mono)',
            }}>⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: 4 }}>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => navStyle(isActive)}>
                <span style={{ fontSize: 12, width: 16, textAlign: 'center', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />

          {/* Projects */}
          <div style={{ marginTop: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 10px', marginBottom: 4,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Проекты
              </span>
              <button onClick={() => setShowCreateModal(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', fontSize: 16, padding: '0 2px',
                borderRadius: 4, lineHeight: 1, transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >+</button>
            </div>

            {inbox && (
              <NavLink to={`/app/project/${inbox.id}`} style={({ isActive }) => navStyle(isActive)}>
                <span style={{ fontSize: 13 }}>{inbox.emoji || '📥'}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inbox.name}
                </span>
              </NavLink>
            )}

            {userProjects.map(project => (
              <div key={project.id} onContextMenu={e => handleRightClick(e, project)}>
                {renamingId === project.id ? (
                  <div style={{ padding: '4px 6px' }}>
                    <input
                      autoFocus value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(project)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(project);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      style={{
                        width: '100%', padding: '5px 8px',
                        borderRadius: 6, border: '1px solid var(--border-light)',
                        background: 'var(--bg-3)', color: 'var(--text)',
                        fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
                      }}
                    />
                  </div>
                ) : (
                  <NavLink
                    to={`/app/project/${project.id}`}
                    style={({ isActive }) => navStyle(isActive)}
                    onDoubleClick={() => startRename(project)}
                  >
                    <span style={{ fontSize: 13 }}>{project.emoji || '📋'}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </span>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: project.color || 'var(--text-3)',
                      flexShrink: 0, opacity: 0.7,
                    }} />
                  </NavLink>
                )}
              </div>
            ))}

            {userProjects.length === 0 && (
              <button onClick={() => setShowCreateModal(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 10px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', fontSize: 13, borderRadius: 8,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ opacity: 0.5 }}>+</span> Создать проект
              </button>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Settings */}
          <NavLink to="/app/settings" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', textDecoration: 'none',
            fontSize: 13, color: 'var(--text-3)',
            background: isActive ? 'var(--bg-3)' : 'none',
            transition: 'background 0.15s',
          })}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-3)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <span style={{ fontSize: 14 }}>⚙</span>
            Настройки
          </NavLink>

          {/* User */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.plan === 'pro' ? '✦ Pro' : 'Free'}
              </div>
            </div>
            <button onClick={logout} title="Выйти" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 15, padding: 4,
              borderRadius: 6, transition: 'color 0.15s', flexShrink: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >↪</button>
          </div>
        </div>
      </aside>

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}

      {contextMenu && (
        <ProjectContextMenu
          projectId={contextMenu.projectId}
          projectName={contextMenu.projectName}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            const p = projects.find(pr => pr.id === contextMenu.projectId);
            if (p) startRename(p);
          }}
        />
      )}
    </>
  );
};