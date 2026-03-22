import {
  Injectable, NotFoundException, Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    @Optional() @InjectQueue('reminders')
    private readonly remindersQueue: Queue,
  ) {}

  // ─── Создание ──────────────────────────────────────────────────
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const count = await this.tasksRepo.count({
      where: { userId, projectId: dto.projectId ?? undefined, deletedAt: IsNull() },
    });

    const task = this.tasksRepo.create({
      ...dto,
      userId,
      order: count * 1000,
      priority: dto.priority ?? 4,
    });

    const saved = await this.tasksRepo.save(task);
    if (saved.deadline) await this.scheduleReminders(saved);
    return saved;
  }

  // ─── Список задач ──────────────────────────────────────────────
  async findAll(userId: string, filters: {
    projectId?: string;
    sectionId?: string;
    completed?: boolean;
    parentTaskId?: string | null;
  }): Promise<Task[]> {
    const query = this.tasksRepo.createQueryBuilder('task')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .where('task.userId = :userId', { userId })
      .andWhere('task.deletedAt IS NULL');

    if (filters.projectId) {
      query.andWhere('task.projectId = :projectId', { projectId: filters.projectId });
    }
    if (filters.sectionId !== undefined) {
      query.andWhere('task.sectionId = :sectionId', { sectionId: filters.sectionId });
    }
    if (filters.completed !== undefined) {
      query.andWhere('task.isCompleted = :completed', { completed: filters.completed });
    }
    if (filters.parentTaskId === null) {
      query.andWhere('task.parentTaskId IS NULL');
    } else if (filters.parentTaskId) {
      query.andWhere('task.parentTaskId = :parentTaskId', { parentTaskId: filters.parentTaskId });
    }

    return query.orderBy('task.order', 'ASC').addOrderBy('task.createdAt', 'ASC').getMany();
  }

  // ─── Одна задача ──────────────────────────────────────────────
  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.tasksRepo.findOne({
      where: { id, userId, deletedAt: IsNull() },
      relations: ['subtasks','labels'],
    });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  // ─── Обновление ────────────────────────────────────────────────
  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(userId, id);
    const oldDeadline = task.deadline;
    Object.assign(task, dto);
    const saved = await this.tasksRepo.save(task);

    // Перепланируем напоминания если дедлайн изменился
    if (saved.deadline && saved.deadline !== oldDeadline) {
      await this.cancelReminders(id);
      await this.scheduleReminders(saved);
    }
    return saved;
  }

  // ─── Завершение ────────────────────────────────────────────────
  async complete(userId: string, id: string): Promise<Task> {
    const task = await this.findOne(userId, id);
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : (null as any);
    if (task.isCompleted) await this.cancelReminders(id);
    return this.tasksRepo.save(task);
  }

  // ─── Изменить порядок ──────────────────────────────────────────
  async reorder(userId: string, id: string, order: number): Promise<Task> {
    const task = await this.findOne(userId, id);
    task.order = order;
    return this.tasksRepo.save(task);
  }

  // ─── Удаление (мягкое) ────────────────────────────────────────
  async remove(userId: string, id: string): Promise<{ message: string }> {
    const task = await this.findOne(userId, id);
    task.deletedAt = new Date();
    await this.tasksRepo.save(task);
    await this.cancelReminders(id);
    return { message: 'Задача удалена' };
  }

  // ─── Задачи на сегодня ────────────────────────────────────────
  async findToday(userId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.tasksRepo.createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('task.isCompleted = false')
      .andWhere('task.deadline < :tomorrow', { tomorrow })
      .andWhere('task.parentTaskId IS NULL')
      .orderBy('task.deadline', 'ASC')
      .addOrderBy('task.order', 'ASC')
      .getMany();
  }


  // ─── Предстоящие (7 дней) ─────────────────────────────────────
  async findUpcoming(userId: string): Promise<Record<string, Task[]>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7days = new Date(today);
    in7days.setDate(in7days.getDate() + 7);

    const tasks = await this.tasksRepo.createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('task.isCompleted = false')
      .andWhere('task.deadline >= :today', { today })
      .andWhere('task.deadline < :in7days', { in7days })
      .andWhere('task.parentTaskId IS NULL')
      .orderBy('task.deadline', 'ASC')
      .addOrderBy('task.order', 'ASC')
      .getMany();

    const grouped: Record<string, Task[]> = {};
    for (const task of tasks) {
      const key = new Date(task.deadline).toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    }
    return grouped;
  }

  // ─── Напоминания ──────────────────────────────────────────────
  private async scheduleReminders(task: Task): Promise<void> {
    if (!this.remindersQueue || !task.deadline) return;

    const deadline = new Date(task.deadline);
    const now = new Date();

    const reminders: { type: '30min' | '1hour' | '1day'; delay: number }[] = [
      { type: '1day',  delay: deadline.getTime() - now.getTime() - 86400000 },
      { type: '1hour', delay: deadline.getTime() - now.getTime() - 3600000 },
      { type: '30min', delay: deadline.getTime() - now.getTime() - 1800000 },
    ];

    for (const reminder of reminders) {
      if (reminder.delay > 0) {
        await this.remindersQueue.add(
          'send-reminder',
          {
            taskId: task.id,
            taskTitle: task.title,
            deadline: task.deadline,
            reminderType: reminder.type,
          },
          {
            delay: reminder.delay,
            jobId: `${task.id}-${reminder.type}`,
            removeOnComplete: true,
          },
        );
      }
    }
  }

  // ─── Поиск ────────────────────────────────────────────────────
  async search(userId: string, query: string): Promise<Task[]> {
    if (!query?.trim()) return [];

    return this.tasksRepo.createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.deletedAt IS NULL')
      .andWhere(
        '(LOWER(task.title) LIKE LOWER(:query) OR LOWER(task.description) LIKE LOWER(:query))',
        { query: `%${query.trim()}%` },
      )
      .orderBy('task.createdAt', 'DESC')
      .limit(20)
      .getMany();
  }
  
  // ─── Метки задачи ─────────────────────────────────────────────
  async addLabel(userId: string, taskId: string, labelId: string): Promise<Task> {
    const task = await this.tasksRepo.findOne({
      where: { id: taskId, userId },
      relations: ['labels'],
    });
    if (!task) throw new NotFoundException('Задача не найдена');

    const alreadyHas = task.labels?.some(l => l.id === labelId);
    if (!alreadyHas) {
      task.labels = [...(task.labels || []), { id: labelId } as any];
      await this.tasksRepo.save(task);
    }
    return this.findOne(userId, taskId);
  }
  // ─── Дублирование ─────────────────────────────────────────────
  async duplicate(userId: string, id: string): Promise<Task> {
    const original = await this.findOne(userId, id);
    const count = await this.tasksRepo.count({
      where: { userId, projectId: original.projectId ?? undefined },
    });

    const copy = this.tasksRepo.create({
      title: `${original.title} (копия)`,
      description: original.description,
      priority: original.priority,
      deadline: original.deadline,
      projectId: original.projectId,
      sectionId: original.sectionId,
      userId,
      order: count * 1000 + 1000,
    });

    return this.tasksRepo.save(copy);
  }

  async removeLabel(userId: string, taskId: string, labelId: string): Promise<Task> {
    const task = await this.tasksRepo.findOne({
      where: { id: taskId, userId },
      relations: ['labels'],
    });
    if (!task) throw new NotFoundException('Задача не найдена');

    task.labels = (task.labels || []).filter(l => l.id !== labelId);
    await this.tasksRepo.save(task);
    return this.findOne(userId, taskId);
  }


  private async cancelReminders(taskId: string): Promise<void> {
    if (!this.remindersQueue) return;
    for (const type of ['30min', '1hour', '1day']) {
      const job = await this.remindersQueue.getJob(`${taskId}-${type}`);
      if (job) await job.remove();
    }
  }
}