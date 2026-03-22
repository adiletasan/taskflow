import {
  Controller, Get, Post, Body,
  Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';

@Controller('project-templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Post('from-project/:projectId')
  @HttpCode(HttpStatus.OK)
  createFromProject(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body('name') name: string,
  ) {
    return this.templatesService.createFromProject(req.user.id, projectId, name);
  }

  @Post('use/:templateId')
  @HttpCode(HttpStatus.OK)
  useTemplate(@Req() req: any, @Param('templateId') templateId: string) {
    return this.templatesService.createProjectFromTemplate(req.user.id, templateId);
  }
}