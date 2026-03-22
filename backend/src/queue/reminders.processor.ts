import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { MailService } from '../mail/mail.service';

export interface ReminderJob {
  taskId: string;
  taskTitle: string;
  userEmail: string;
  userName: string;
  deadline: string;
  reminderType: '30min' | '1hour' | '1day';
}

@Processor('reminders')
export class RemindersProcessor {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process('send-reminder')
  async handleReminder(job: Job<ReminderJob>) {
    const { taskTitle, userEmail, userName, deadline, reminderType } = job.data;

    const timeText = {
      '30min': 'через 30 минут',
      '1hour': 'через 1 час',
      '1day':  'завтра',
    }[reminderType];

    this.logger.log(`Sending reminder for task "${taskTitle}" to ${userEmail}`);

    await this.mailService.sendReminderEmail(userEmail, userName, taskTitle, deadline, timeText);
  }
}