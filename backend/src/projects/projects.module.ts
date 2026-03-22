import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Section } from './entities/section.entity';
import { UserProjectPreference } from './entities/user-project-preference.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, Section,
      UserProjectPreference, ProjectMember,
    ]),
    UsersModule,
  ],
  providers: [ProjectsService, CollaborationService],
  controllers: [ProjectsController, CollaborationController],
  exports: [ProjectsService, CollaborationService],
})
export class ProjectsModule {}