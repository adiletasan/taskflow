import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: 'Подтверди свой email — Taskflow',
        html: this.baseTemplate(`
          <h2>Привет, ${name}! 👋</h2>
          <p>Подтверди свой email чтобы начать пользоваться Taskflow.</p>
          <a href="${url}" class="btn">Подтвердить email</a>
          <p class="hint">Ссылка действует 24 часа.</p>
        `),
      });
    } catch (e) {
      this.logger.error(`Failed to send verification email`, e);
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: 'Сброс пароля — Taskflow',
        html: this.baseTemplate(`
          <h2>Сброс пароля</h2>
          <p>Привет, ${name}! Ты запросил сброс пароля.</p>
          <a href="${url}" class="btn">Сбросить пароль</a>
          <p class="hint">Ссылка действует 1 час.</p>
        `),
      });
    } catch (e) {
      this.logger.error(`Failed to send password reset email`, e);
    }
  }

  async sendReminderEmail(
    email: string,
    name: string,
    taskTitle: string,
    deadline: string,
    timeText: string,
  ): Promise<void> {
    const date = new Date(deadline).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: `Напоминание: ${taskTitle}`,
        html: this.baseTemplate(`
          <h2>⏰ Напоминание о задаче</h2>
          <p>Привет, ${name}!</p>
          <p>Задача <strong>"${taskTitle}"</strong> должна быть выполнена ${timeText}.</p>
          <p class="hint">Дедлайн: ${date}</p>
        `),
      });
    } catch (e) {
      this.logger.error(`Failed to send reminder email`, e);
    }
  }

  private baseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, sans-serif; background: #0e0e0f; color: #e8e8ea; margin: 0; padding: 40px 20px; }
          .container { max-width: 480px; margin: 0 auto; background: #141415; border: 1px solid #2a2a2d; border-radius: 16px; padding: 32px; }
          h2 { font-size: 20px; font-weight: 600; margin: 0 0 12px; }
          p { font-size: 14px; color: #9898a0; line-height: 1.6; margin: 8px 0; }
          .btn { display: inline-block; margin: 20px 0; padding: 12px 24px; background: #e5483a; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
          .hint { font-size: 12px; color: #5a5a62; }
        </style>
      </head>
      <body>
        <div class="container">${content}</div>
      </body>
      </html>
    `;
  }

  async sendInviteEmail(
    email: string,
    name: string,
    projectName: string,
    token: string,
  ): Promise<void> {
    const url = `${this.configService.get('FRONTEND_URL')}/invite/${token}`;
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: `Приглашение в проект "${projectName}" — Taskflow`,
        html: this.baseTemplate(`
          <h2>Тебя пригласили! 🎉</h2>
          <p>Привет, ${name}!</p>
          <p>Тебя пригласили присоединиться к проекту <strong>"${projectName}"</strong> в Taskflow.</p>
          <a href="${url}" class="btn">Принять приглашение</a>
          <p class="hint">Ссылка действует 7 дней.</p>
        `),
      });
    } catch (e) {
      this.logger.error('Failed to send invite email', e);
    }
  }
}