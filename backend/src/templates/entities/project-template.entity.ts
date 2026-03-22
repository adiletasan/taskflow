import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface TemplateSection {
  name: string;
  tasks: { title: string; priority?: number }[];
}

export interface TemplateStructure {
  sections: TemplateSection[];
  tasks: { title: string; priority?: number }[];
}

@Entity('project_templates')
export class ProjectTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'jsonb' })
  structure: TemplateStructure;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}