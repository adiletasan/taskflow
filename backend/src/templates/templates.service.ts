import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectTemplate } from './entities/project-template.entity';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(ProjectTemplate)
    private readonly templatesRepo: Repository<ProjectTemplate>,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  async findAll(): Promise<ProjectTemplate[]> {
    return this.templatesRepo.find({
      where: [{ isPublic: true }],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProjectTemplate> {
    const template = await this.templatesRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Шаблон не найден');
    return template;
  }

  async createFromProject(userId: string, projectId: string, name: string): Promise<ProjectTemplate> {
    const project = await this.projectsService.findOne(userId, projectId);
    const sections = await this.projectsService.findSections(userId, projectId);
    const tasks = await this.tasksService.findAll(userId, { projectId, parentTaskId: null });

    const structure = {
      sections: sections.map(s => ({
        name: s.name,
        tasks: tasks
          .filter(t => t.sectionId === s.id)
          .map(t => ({ title: t.title, priority: t.priority })),
      })),
      tasks: tasks
        .filter(t => !t.sectionId)
        .map(t => ({ title: t.title, priority: t.priority })),
    };

    const template = this.templatesRepo.create({
      name, description: `Шаблон из проекта ${project.name}`,
      emoji: project.emoji, color: project.color,
      structure, isPublic: false, userId,
    });

    return this.templatesRepo.save(template);
  }

  async createProjectFromTemplate(userId: string, templateId: string): Promise<any> {
    const template = await this.findOne(templateId);

    // Создаём проект
    const project = await this.projectsService.create(userId, {
      name: template.name,
      emoji: template.emoji,
      color: template.color,
    });

    // Создаём задачи без секции
    for (const task of template.structure.tasks || []) {
      await this.tasksService.create(userId, {
        title: task.title,
        priority: task.priority || 4,
        projectId: project.id,
      });
    }

    // Создаём секции и задачи в них
    for (const section of template.structure.sections || []) {
      const createdSection = await this.projectsService.createSection(
        userId, project.id, { name: section.name },
      );
      for (const task of section.tasks || []) {
        await this.tasksService.create(userId, {
          title: task.title,
          priority: task.priority || 4,
          projectId: project.id,
          sectionId: createdSection.id,
        });
      }
    }

    return project;
  }

  async seedPublicTemplates(): Promise<void> {
    const count = await this.templatesRepo.count({ where: { isPublic: true } });
    if (count > 0) return;

    const templates = [
      {
        name: 'GTD — Getting Things Done',
        description: 'Классическая методология GTD для управления задачами',
        emoji: '🧠',
        color: '#3b82f6',
        isPublic: true,
        structure: {
          tasks: [],
          sections: [
            { name: '📥 Входящие', tasks: [{ title: 'Собрать все незавершённые дела', priority: 2 }] },
            { name: '⚡ Следующие действия', tasks: [{ title: 'Определить следующий шаг', priority: 2 }] },
            { name: '📅 Запланировано', tasks: [] },
            { name: '🕐 Когда-нибудь', tasks: [{ title: 'Идеи на будущее', priority: 4 }] },
            { name: '✅ Выполнено', tasks: [] },
          ],
        },
      },
      {
        name: 'Agile Sprint',
        description: 'Kanban-доска для Agile разработки',
        emoji: '🚀',
        color: '#10b981',
        isPublic: true,
        structure: {
          tasks: [],
          sections: [
            { name: '📋 Бэклог', tasks: [
              { title: 'Написать технические требования', priority: 2 },
              { title: 'Настроить CI/CD', priority: 3 },
            ]},
            { name: '🔄 В работе', tasks: [] },
            { name: '👀 На проверке', tasks: [] },
            { name: '✅ Готово', tasks: [] },
          ],
        },
      },
      {
        name: 'Планирование свадьбы',
        description: 'Полный план подготовки к свадьбе',
        emoji: '💍',
        color: '#ec4899',
        isPublic: true,
        structure: {
          tasks: [],
          sections: [
            { name: '📅 За год', tasks: [
              { title: 'Определить дату и бюджет', priority: 1 },
              { title: 'Выбрать и забронировать площадку', priority: 1 },
              { title: 'Найти фотографа', priority: 2 },
            ]},
            { name: '🗓 За 6 месяцев', tasks: [
              { title: 'Разослать приглашения', priority: 1 },
              { title: 'Выбрать платье / костюм', priority: 2 },
              { title: 'Заказать торт', priority: 2 },
            ]},
            { name: '📆 За месяц', tasks: [
              { title: 'Подтвердить всех поставщиков', priority: 1 },
              { title: 'Финальная примерка', priority: 1 },
              { title: 'Составить расписание дня', priority: 2 },
            ]},
          ],
        },
      },
    ];

    for (const t of templates) {
      await this.templatesRepo.save(this.templatesRepo.create(t as any));
    }
  }
}