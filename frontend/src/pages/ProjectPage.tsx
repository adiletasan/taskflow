import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';
import { ViewSwitcher } from '../components/projects/ViewSwitcher';
import { ListView } from '../components/projects/ListView';
import { BoardView } from '../components/projects/BoardView';
import { CalendarView } from '../components/projects/CalendarView';
import { ShareProjectModal } from '../components/projects/ShareProjectModal';

type View = 'list' | 'board' | 'calendar';

export const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [showShare, setShowShare] = useState(false);

  const QUERY_KEY = ['tasks', 'project', id!];

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getOne(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', id],
    queryFn: () => projectsApi.getSections(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => tasksApi.getAll({ projectId: id }).then(r => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    projectsApi.getView(id).then(r => {
      setView((r.data as any).view || 'list');
    }).catch(() => {});
  }, [id]);

  const handleViewChange = (v: View) => {
    setView(v);
    if (id) projectsApi.setView(id, v).catch(() => {});
  };

  if (!project) return (
    <div style={{ padding: '24px 28px', color: 'var(--text-3)' }}>Загрузка...</div>
  );

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{
        padding: '20px 28px 0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{project.emoji || '📋'}</span>
          <h1 style={{
            fontSize: 22, fontWeight: 600,
            color: 'var(--text)', letterSpacing: '-0.5px',
          }}>
            {project.name}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowShare(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-2)',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-3)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <span style={{ fontSize: 13 }}>⊕</span>
            Поделиться
          </button>
          <ViewSwitcher current={view} onChange={handleViewChange} />
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 28px',
        maxWidth: view === 'list' ? 680 : 'none',
      }}>
        {view === 'list' && (
          <ListView
            tasks={tasks}
            sections={sections}
            projectId={id!}
            queryKey={QUERY_KEY}
            onOpenDetail={setDetailId}
            isLoading={isLoading}
          />
        )}
        {view === 'board' && (
          <BoardView
            tasks={tasks}
            sections={sections}
            projectId={id!}
            queryKey={QUERY_KEY}
            onOpenDetail={setDetailId}
            isLoading={isLoading}
          />
        )}
        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            projectId={id!}
            queryKey={QUERY_KEY}
            onOpenDetail={setDetailId}
          />
        )}
      </div>

      <TaskDetailPanel taskId={detailId} onClose={() => setDetailId(null)} />

      {showShare && (
        <ShareProjectModal
          projectId={id!}
          projectName={project.name}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};