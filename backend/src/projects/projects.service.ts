import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Section } from './entities/section.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UserProjectPreference, ProjectView } from './entities/user-project-preference.entity';

const FREE_PROJECT_LIMIT = 5;

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(Section)
    private readonly sectionsRepo: Repository<Section>,
    @InjectRepository(UserProjectPreference)
    private readonly preferencesRepo: Repository<UserProjectPreference>,
  ) {}

  // ─── Inbox ─────────────────────────────────────────────────────
  async createInbox(userId: string): Promise<Project> {
    const inbox = this.projectsRepo.create({
      name: 'Входящие',
      emoji: '📥',
      color: '#808080',
      isInbox: true,
      order: 0,
      userId,
    });
    return this.projectsRepo.save(inbox);
  }

  // ─── Создание проекта ──────────────────────────────────────────
  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    // Проверяем лимит free плана
    const count = await this.projectsRepo.count({
      where: { userId, isInbox: false },
    });
    if (count >= FREE_PROJECT_LIMIT) {
      throw new BadRequestException(
        'Достигнут лимит проектов для бесплатного плана (5 проектов)',
      );
    }

    const lastProject = await this.projectsRepo.findOne({
      where: { userId },
      order: { order: 'DESC' },
    });

    const project = this.projectsRepo.create({
      ...dto,
      userId,
      order: (lastProject?.order ?? 0) + 1000,
    });
    return this.projectsRepo.save(project);
  }

  // ─── Список проектов ───────────────────────────────────────────
  async findAll(userId: string): Promise<Project[]> {
    return this.projectsRepo.find({
      where: { userId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  // ─── Один проект ───────────────────────────────────────────────
  async findOne(userId: string, id: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id, userId },
      relations: ['sections'],
    });
    if (!project) throw new NotFoundException('Проект не найден');
    return project;
  }

  // ─── Обновление ────────────────────────────────────────────────
  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(userId, id);
    if (project.isInbox) throw new ForbiddenException('Нельзя изменить Входящие');
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  // ─── Удаление ──────────────────────────────────────────────────
  async remove(userId: string, id: string): Promise<{ message: string }> {
    const project = await this.findOne(userId, id);
    if (project.isInbox) throw new ForbiddenException('Нельзя удалить Входящие');
    await this.projectsRepo.remove(project);
    return { message: 'Проект удалён' };
  }

  // ─── Секции ────────────────────────────────────────────────────
  async createSection(userId: string, projectId: string, dto: CreateSectionDto): Promise<Section> {
    await this.findOne(userId, projectId); // проверяем доступ

    const last = await this.sectionsRepo.findOne({
      where: { projectId },
      order: { order: 'DESC' },
    });

    const section = this.sectionsRepo.create({
      ...dto,
      projectId,
      order: (last?.order ?? 0) + 1000,
    });
    return this.sectionsRepo.save(section);
  }

  async getView(userId: string, projectId: string): Promise<ProjectView> {
    const pref = await this.preferencesRepo.findOne({ where: { userId, projectId } });
    return pref?.view || 'list';
  }

  async findSections(userId: string, projectId: string): Promise<Section[]> {
    await this.findOne(userId, projectId);
    return this.sectionsRepo.find({
      where: { projectId },
      order: { order: 'ASC' },
    });
  }

  async setView(userId: string, projectId: string, view: ProjectView): Promise<void> {
    let pref = await this.preferencesRepo.findOne({ where: { userId, projectId } });
    if (!pref) {
      pref = this.preferencesRepo.create({ userId, projectId, view });
    } else {
      pref.view = view;
    }
    await this.preferencesRepo.save(pref);
  }
  

  async updateSection(userId: string, projectId: string, sectionId: string, dto: UpdateSectionDto): Promise<Section> {
    await this.findOne(userId, projectId);
    const section = await this.sectionsRepo.findOne({ where: { id: sectionId, projectId } });
    if (!section) throw new NotFoundException('Секция не найдена');
    Object.assign(section, dto);
    return this.sectionsRepo.save(section);
  }

  async removeSection(userId: string, projectId: string, sectionId: string): Promise<{ message: string }> {
    await this.findOne(userId, projectId);
    const section = await this.sectionsRepo.findOne({ where: { id: sectionId, projectId } });
    if (!section) throw new NotFoundException('Секция не найдена');
    await this.sectionsRepo.remove(section);
    return { message: 'Секция удалена' };
  }
}