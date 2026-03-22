import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

export enum ActivityAction {
  CREATED    = 'created',
  UPDATED    = 'updated',
  COMPLETED  = 'completed',
  REOPENED   = 'reopened',
  DELETED    = 'deleted',
  COMMENTED  = 'commented',
  LABEL_ADDED   = 'label_added',
  LABEL_REMOVED = 'label_removed',
  PRIORITY_CHANGED = 'priority_changed',
  DEADLINE_CHANGED = 'deadline_changed',
}

@Entity('task_activities')
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  taskId: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  action: ActivityAction;

  @Column({ type: 'text', nullable: true })
  oldValue: string;

  @Column({ type: 'text', nullable: true })
  newValue: string;

  @CreateDateColumn()
  createdAt: Date;
}