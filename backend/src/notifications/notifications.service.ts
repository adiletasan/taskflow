import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationsRepo.create({ userId, type, data });
    return this.notificationsRepo.save(notification);
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepo.count({
      where: { userId, isRead: false },
    });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.notificationsRepo.update(
      { id, userId },
      { isRead: true },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.notificationsRepo.delete({ id, userId });
  }

  async clearAll(userId: string): Promise<void> {
    await this.notificationsRepo.delete({ userId });
  }
}