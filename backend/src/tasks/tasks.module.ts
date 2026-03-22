import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Task } from './entities/task.entity';
import { TaskComment } from './entities/task-comment.entity';
import { TaskActivity } from './entities/task-activity.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { CommentsService } from './comments.service';
import { RemindersProcessor } from '../queue/reminders.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskComment, TaskActivity]),
    BullModule.registerQueue({ name: 'reminders' }),
  ],
  providers: [TasksService, CommentsService, RemindersProcessor],
  controllers: [TasksController],
  exports: [TasksService, CommentsService],
})
export class TasksModule {}