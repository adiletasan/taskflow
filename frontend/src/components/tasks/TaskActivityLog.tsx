import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks';

interface Props {
  taskId: string;
}

const ACTION_LABELS: Record<string, string> = {
  created:          'создал задачу',
  updated:          'обновил задачу',
  completed:        'выполнил задачу',
  reopened:         'переоткрыл задачу',
  deleted:          'удалил задачу',
  commented:        'прокомментировал',
  label_added:      'добавил метку',
  label_removed:    'удалил метку',
  priority_changed: 'изменил приоритет',
  deadline_changed: 'изменил дедлайн',
};

export const TaskActivityLog = ({ taskId }: Props) => {
  const { data: activities = [] } = useQuery({
    queryKey: ['activity', taskId],
    queryFn: () => tasksApi.getActivity(taskId).then(r => r.data),
    enabled: !!taskId,
  });

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (activities.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'block', marginBottom: 10,
      }}>
        История
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map(activity => (
          <div key={activity.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            {/* Dot */}
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--border-light)',
              flexShrink: 0, marginTop: 5,
            }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                  {activity.user?.name}
                </span>
                {' '}{ACTION_LABELS[activity.action] || activity.action}
                {activity.newValue && (
                  <span style={{
                    color: 'var(--text-3)',
                    fontStyle: 'italic',
                  }}> «{activity.newValue}»</span>
                )}
              </span>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                {formatTime(activity.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};