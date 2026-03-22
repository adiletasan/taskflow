import {
  Injectable, NotFoundException,
  ForbiddenException, BadRequestException, Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { ProjectMember, MemberRole } from './entities/project-member.entity';
import { Project } from './entities/project.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly membersRepo: Repository<ProjectMember>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ─── Пригласить по email ───────────────────────────────────────
  async invite(
    inviterId: string,
    projectId: string,
    email: string,
    role: MemberRole = MemberRole.MEMBER,
  ) {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Проект не найден');

    await this.checkIsAdmin(inviterId, projectId);

    const invitee = await this.usersService.findByEmail(email);
    if (!invitee) throw new NotFoundException('Пользователь не найден');

    const existing = await this.membersRepo.findOne({
      where: { projectId, userId: invitee.id },
    });
    if (existing) throw new BadRequestException('Пользователь уже является участником');

    const token = uuidv4();
    await this.redis.set(
      `invite:${token}`,
      JSON.stringify({ projectId, userId: invitee.id, role, invitedBy: inviterId }),
      'EX', 60 * 60 * 24 * 7, // 7 дней
    );

    await this.mailService.sendInviteEmail(
      email, invitee.name, project.name, token,
    );

    return { message: 'Приглашение отправлено' };
  }

  // ─── Принять приглашение ───────────────────────────────────────
  async acceptInvite(token: string) {
    const raw = await this.redis.get(`invite:${token}`);
    if (!raw) throw new BadRequestException('Ссылка недействительна или истекла');

    const { projectId, userId, role, invitedBy } = JSON.parse(raw);

    const existing = await this.membersRepo.findOne({ where: { projectId, userId } });
    if (!existing) {
      await this.membersRepo.save(
        this.membersRepo.create({
          projectId, userId, role,
          invitedBy, acceptedAt: new Date(),
        }),
      );
    }

    await this.redis.del(`invite:${token}`);
    return { message: 'Вы успешно присоединились к проекту', projectId };
  }

  // ─── Публичная ссылка ──────────────────────────────────────────
  async generateInviteLink(inviterId: string, projectId: string) {
    await this.checkIsAdmin(inviterId, projectId);
    const token = uuidv4();
    await this.redis.set(
      `invite-link:${token}`,
      JSON.stringify({ projectId, role: MemberRole.MEMBER }),
      'EX', 60 * 60 * 24 * 30, // 30 дней
    );
    return { token, url: `/invite/${token}` };
  }

  // ─── Список участников ─────────────────────────────────────────
  async getMembers(projectId: string) {
    return this.membersRepo.find({
      where: { projectId },
      relations: ['user'],
      order: { invitedAt: 'ASC' },
    });
  }

  // ─── Удалить участника ─────────────────────────────────────────
  async removeMember(adminId: string, projectId: string, userId: string) {
    await this.checkIsAdmin(adminId, projectId);
    const member = await this.membersRepo.findOne({ where: { projectId, userId } });
    if (!member) throw new NotFoundException('Участник не найден');
    await this.membersRepo.remove(member);
    return { message: 'Участник удалён' };
  }

  // ─── Изменить роль ─────────────────────────────────────────────
  async updateRole(adminId: string, projectId: string, userId: string, role: MemberRole) {
    await this.checkIsAdmin(adminId, projectId);
    const member = await this.membersRepo.findOne({ where: { projectId, userId } });
    if (!member) throw new NotFoundException('Участник не найден');
    member.role = role;
    return this.membersRepo.save(member);
  }

  // ─── Вспомогательные ──────────────────────────────────────────
  private async checkIsAdmin(userId: string, projectId: string) {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Проект не найден');

    if (project.userId === userId) return; // владелец

    const member = await this.membersRepo.findOne({ where: { projectId, userId } });
    if (!member || member.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Нет прав администратора');
    }
  }
}