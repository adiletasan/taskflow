import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Section } from '../../projects/entities/section.entity';
import { Label } from '../../labels/entities/label.entity';

export enum TaskPriority {
  P1 = 1, P2 = 2, P3 = 3, P4 = 4,
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 4 })
  priority: number;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'time', nullable: true })
  deadlineTime: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date | null;

  @Column({ type: 'float', default: 0 })
  order: number;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => Project, project => project.tasks, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  sectionId: string;

  @ManyToOne(() => Section, section => section.tasks, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @Column({ nullable: true })
  parentTaskId: string;

  @ManyToOne(() => Task, task => task.subtasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentTaskId' })
  parentTask: Task;

  @OneToMany(() => Task, task => task.parentTask)
  subtasks: Task[];

  @ManyToMany(() => Label, label => label.tasks, { eager: false })
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'taskId' },
    inverseJoinColumn: { name: 'labelId' },
  })
  labels: Label[];

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}