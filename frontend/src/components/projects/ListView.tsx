import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Section } from '../../types';
import { TaskItem } from '../tasks/TaskItem';
import { QuickAddTask } from '../tasks/QuickAddTask';
import { tasksApi } from '../../api/tasks';
import { useQueryClient } from '@tanstack/react-query';

interface SortableTaskProps {
  task: Task;
  queryKey: string[];
  onOpenDetail: (id: string) => void;
}

const SortableTask = ({ task, queryKey, onOpenDetail }: SortableTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskItem task={task} queryKey={queryKey} onOpenDetail={onOpenDetail} />
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

export const ListView = ({ tasks, sections, projectId, queryKey, onOpenDetail, isLoading }: Props) => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  const noSectionTasks = tasks.filter(t => !t.sectionId && !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = noSectionTasks.findIndex(t => t.id === active.id);
    const newIndex = noSectionTasks.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(noSectionTasks, oldIndex, newIndex);

    // Обновляем order
    const updates = reordered.map((task, i) =>
      tasksApi.reorder(task.id, i * 1000)
    );
    await Promise.all(updates);
    queryClient.invalidateQueries({ queryKey });
  };

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 36, borderRadius: 8, background: 'var(--bg-3)', opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  );

  return (
    <div>
      {/* Quick add */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '9px 12px',
          borderRadius: 8, border: '1px dashed var(--border)',
          background: 'none', cursor: 'pointer', marginBottom: 12,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.background = 'var(--bg-2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'none';
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: 16 }}>+</span>
          <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>Добавить задачу</span>
        </button>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <QuickAddTask projectId={projectId} queryKey={queryKey} autoFocus onClose={() => setShowAdd(false)} />
        </div>
      )}

      {/* Задачи без секции с drag & drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={noSectionTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {noSectionTasks.map(task => (
            <SortableTask key={task.id} task={task} queryKey={queryKey} onOpenDetail={onOpenDetail} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Секции */}
      {sections.map(section => {
        const sectionTasks = tasks.filter(t => t.sectionId === section.id && !t.isCompleted);
        return (
          <div key={section.id} style={{ marginTop: 20, marginBottom: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', marginBottom: 4,
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{section.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sectionTasks.length}</span>
            </div>
            {sectionTasks.map(task => (
              <TaskItem key={task.id} task={task} queryKey={queryKey} onOpenDetail={onOpenDetail} />
            ))}
            <div style={{ marginTop: 4 }}>
              <QuickAddTask projectId={projectId} sectionId={section.id} queryKey={queryKey} />
            </div>
          </div>
        );
      })}

      {/* Выполненные */}
      {completedTasks.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            cursor: 'pointer', padding: '6px 12px', listStyle: 'none',
          }}>
            Выполнено · {completedTasks.length}
          </summary>
          <div style={{ opacity: 0.5, marginTop: 4 }}>
            {completedTasks.map(task => (
              <TaskItem key={task.id} task={task} queryKey={queryKey} onOpenDetail={onOpenDetail} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};