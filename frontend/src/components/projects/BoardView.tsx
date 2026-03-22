import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Section } from '../../types';
import { PRIORITY_COLORS } from '../tasks/PriorityIcon';
import { tasksApi } from '../../api/tasks';
import { projectsApi } from '../../api/projects';
import { useQueryClient } from '@tanstack/react-query';

interface KanbanCardProps {
  task: Task;
  onOpenDetail: (id: string) => void;
}

const KanbanCard = ({ task, onOpenDetail }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const isOverdue = task.deadline && !task.isCompleted &&
    new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      ref={setNodeRef}
      onClick={() => onOpenDetail(task.id)}
      style={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.3 : 1,
        padding: '10px 12px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        cursor: 'pointer',
        marginBottom: 6,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...attributes}
      {...listeners}
    >
      {/* Priority line */}
      <div style={{
        width: 3, height: '100%',
        position: 'absolute', left: 0, top: 0,
        borderRadius: '10px 0 0 10px',
        background: PRIORITY_COLORS[task.priority as 1|2|3|4]?.color,
        opacity: task.priority < 4 ? 0.8 : 0,
      }} />

      <p style={{
        fontSize: 13.5, color: 'var(--text)',
        lineHeight: 1.4, marginBottom: 6,
        textDecoration: task.isCompleted ? 'line-through' : 'none',
      }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {task.deadline && (
          <span style={{ fontSize: 11, color: isOverdue ? 'var(--accent)' : 'var(--text-3)' }}>
            ◷ {new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            ⊞ {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: PRIORITY_COLORS[task.priority as 1|2|3|4]?.color,
            opacity: task.priority < 4 ? 0.8 : 0.2,
          }} />
        </div>
      </div>
    </div>
  );
};

interface ColumnProps {
  title: string;
  tasks: Task[];
  sectionId?: string;
  projectId: string;
  queryKey: string[];
  onOpenDetail: (id: string) => void;
  onAddTask: (sectionId?: string) => void;
}

const KanbanColumn = ({ title, tasks, sectionId, onOpenDetail, onAddTask }: ColumnProps) => {
  const activeTasks = tasks.filter(t => !t.isCompleted);

  return (
    <div style={{
      width: 280, minWidth: 280,
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 200px)',
    }}>
      {/* Column header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
          <span style={{
            fontSize: 11, color: 'var(--text-3)',
            background: 'var(--bg-4)', borderRadius: 99,
            padding: '1px 7px', fontFamily: 'var(--font-mono)',
          }}>{activeTasks.length}</span>
        </div>
        <button onClick={() => onAddTask(sectionId)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-3)', fontSize: 18, padding: '0 2px',
          borderRadius: 4, lineHeight: 1, transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >+</button>
      </div>

      {/* Tasks */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <SortableContext
          items={activeTasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {activeTasks.map(task => (
            <KanbanCard key={task.id} task={task} onOpenDetail={onOpenDetail} />
          ))}
        </SortableContext>

        {activeTasks.length === 0 && (
          <div style={{
            padding: '20px 0', textAlign: 'center',
            color: 'var(--text-3)', fontSize: 13,
          }}>
            Нет задач
          </div>
        )}
      </div>
    </div>
  );
};

interface Props {
  tasks: Task[];
  sections: Section[];
  projectId: string;
  queryKey: string[];
  onOpenDetail: (id: string) => void;
  isLoading: boolean;
}

export const BoardView = ({ tasks, sections, projectId, queryKey, onOpenDetail, isLoading }: Props) => {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const task = tasks.find(t => t.id === active.id);
    if (!task) return;

    // Если над другой задачей — меняем sectionId
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask && overTask.sectionId !== task.sectionId) {
      await tasksApi.update(task.id, { sectionId: overTask.sectionId || undefined });
      queryClient.invalidateQueries({ queryKey });
    }

    setActiveTask(null);
  };

  const handleAddTask = async (sectionId?: string) => {
    const title = prompt('Название задачи:');
    if (!title?.trim()) return;
    await tasksApi.create({ title: title.trim(), projectId, sectionId });
    queryClient.invalidateQueries({ queryKey });
  };

  if (isLoading) return (
    <div style={{ display: 'flex', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          width: 280, height: 400, borderRadius: 12,
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          opacity: 1 - i * 0.2,
        }} />
      ))}
    </div>
  );

  // Колонки: задачи без секции + каждая секция
  const noSectionTasks = tasks.filter(t => !t.sectionId);
  const columns = [
    { id: 'no-section', title: 'Без секции', tasks: noSectionTasks, sectionId: undefined },
    ...sections.map(s => ({
      id: s.id, title: s.name, sectionId: s.id,
      tasks: tasks.filter(t => t.sectionId === s.id),
    })),
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={e => setActiveTask(tasks.find(t => t.id === e.active.id) || null)}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', paddingBottom: 16,
        alignItems: 'flex-start',
      }}>
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            tasks={col.tasks}
            sectionId={col.sectionId}
            projectId={projectId}
            queryKey={queryKey}
            onOpenDetail={onOpenDetail}
            onAddTask={handleAddTask}
          />
        ))}

        {/* Добавить колонку */}
        <button
          onClick={async () => {
            const name = prompt('Название секции:');
            if (!name?.trim()) return;
            await projectsApi.createSection(projectId, name.trim());
            queryClient.invalidateQueries({ queryKey: ['sections', projectId] });
          }}
          style={{
            width: 220, minWidth: 220, height: 48,
            borderRadius: 12, border: '1px dashed var(--border)',
            background: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.color = 'var(--text-2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          <span style={{ fontSize: 16 }}>+</span> Добавить колонку
        </button>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border-light)',
            borderRadius: 10, width: 260,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            fontSize: 13.5, color: 'var(--text)',
          }}>
            {activeTask.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};