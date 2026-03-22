import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private projectsService: ProjectsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  // ─── Регистрация ───────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email уже используется');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    await this.projectsService.createInbox(user.id);

    const verifyToken = uuidv4();
    await this.redis.set(`verify:${verifyToken}`, user.id, 'EX', 86400);
    await this.mailService.sendVerificationEmail(user.email, user.name, verifyToken);

    return { message: 'Регистрация успешна. Проверь email для подтверждения.' };
  }

  // ─── Вход ──────────────────────────────────────────────────────
  async login(dto: LoginDto, res: any) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Неверный email или пароль');

    return this.generateTokens(user, res);
  }

  // ─── Refresh ───────────────────────────────────────────────────
  async refresh(refreshToken: string, res: any) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token не найден');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    const stored = await this.redis.get(`refresh:${payload.sub}:${refreshToken}`);
    if (!stored) throw new UnauthorizedException('Refresh token отозван');

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    return this.generateTokens(user, res);
  }

  // ─── Logout ────────────────────────────────────────────────────
  async logout(userId: string, refreshToken: string, res: any) {
    if (refreshToken) {
      await this.redis.del(`refresh:${userId}:${refreshToken}`);
    }
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return { message: 'Выход выполнен' };
  }

  // ─── Верификация email ─────────────────────────────────────────
  async verifyEmail(token: string) {
    const userId = await this.redis.get(`verify:${token}`);
    if (!userId) throw new BadRequestException('Ссылка недействительна или истекла');

    await this.usersService.update(userId, { isEmailVerified: true });
    await this.redis.del(`verify:${token}`);

    return { message: 'Email подтверждён!' };
  }

  // ─── Забыл пароль ──────────────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'Если email существует, письмо отправлено' };

    const token = uuidv4();
    await this.redis.set(`reset:${token}`, user.id, 'EX', 3600);
    await this.mailService.sendPasswordResetEmail(user.email, user.name, token);

    return { message: 'Если email существует, письмо отправлено' };
  }

  // ─── Сброс пароля ──────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get(`reset:${token}`);
    if (!userId) throw new BadRequestException('Ссылка недействительна или истекла');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersService.update(userId, { passwordHash });
    await this.redis.del(`reset:${token}`);

    return { message: 'Пароль успешно изменён' };
  }

  // ─── Получить текущего пользователя ───────────────────────────
  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  // ─── Принять приглашение ───────────────────────────────────────
  async acceptInvite(token: string) {
    const raw = await this.redis.get(`invite:${token}`);
    if (!raw) throw new BadRequestException('Ссылка недействительна или истекла');
    return { token, message: 'Используй /projects/invite/:token/accept' };
  }

  // ─── Вспомогательные методы ────────────────────────────────────
  private async generateTokens(user: any, res: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '30d',
    });

    await this.redis.set(
      `refresh:${user.id}:${refreshToken}`,
      '1',
      'EX',
      60 * 60 * 24 * 30,
    );

    // ← sameSite: 'none' + secure: true для cross-domain cookies
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}