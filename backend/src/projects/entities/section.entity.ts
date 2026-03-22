import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'float', default: 0 })
  order: number;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @OneToMany(() => Task, (task) => task.section)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}