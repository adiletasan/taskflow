import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskComment } from './entities/task-comment.entity';
import { TaskActivity, ActivityAction } from './entities/task-activity.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly commentsRepo: Repository<TaskComment>,
    @InjectRepository(TaskActivity)
    private readonly activityRepo: Repository<TaskActivity>,
  ) {}

  async create(userId: string, taskId: string, dto: CreateCommentDto): Promise<TaskComment> {
    const comment = this.commentsRepo.create({ ...dto, userId, taskId });
    const saved = await this.commentsRepo.save(comment);

    // Логируем активность
    await this.activityRepo.save(
      this.activityRepo.create({
        taskId, userId,
        action: ActivityAction.COMMENTED,
        newValue: dto.content.slice(0, 100),
      }),
    );

    const result = await this.commentsRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });

    if (!result) throw new NotFoundException('Комментарий не найден');
    return result;
  }

  async findAll(taskId: string): Promise<TaskComment[]> {
    return this.commentsRepo.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(userId: string, id: string, dto: UpdateCommentDto): Promise<TaskComment> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Комментарий не найден');
    if (comment.userId !== userId) throw new ForbiddenException('Нет доступа');
    comment.content = dto.content;
    return this.commentsRepo.save(comment);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Комментарий не найден');
    if (comment.userId !== userId) throw new ForbiddenException('Нет доступа');
    await this.commentsRepo.remove(comment);
    return { message: 'Комментарий удалён' };
  }

  async getActivity(taskId: string): Promise<TaskActivity[]> {
    return this.activityRepo.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async logActivity(
    taskId: string,
    userId: string,
    action: ActivityAction,
    oldValue?: string,
    newValue?: string,
  ): Promise<void> {
    await this.activityRepo.save(
      this.activityRepo.create({ taskId, userId, action, oldValue, newValue }),
    );
  }
}