import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.projectsService.remove(req.user.id, id);
  }

  // ─── Секции ────────────────────────────────────────────────────
  @Post(':id/sections')
  createSection(
    @Req() req: any,
    @Param('id') projectId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.projectsService.createSection(req.user.id, projectId, dto);
  }

  @Get(':id/sections')
  findSections(@Req() req: any, @Param('id') projectId: string) {
    return this.projectsService.findSections(req.user.id, projectId);
  }

  @Patch(':id/sections/:sectionId')
  updateSection(
    @Req() req: any,
    @Param('id') projectId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.projectsService.updateSection(req.user.id, projectId, sectionId, dto);
  }

  @Delete(':id/sections/:sectionId')
  @HttpCode(HttpStatus.OK)
  removeSection(
    @Req() req: any,
    @Param('id') projectId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.projectsService.removeSection(req.user.id, projectId, sectionId);
  }
  
  @Get(':id/view')
  getView(@Req() req: any, @Param('id') id: string) {
    return this.projectsService.getView(req.user.id, id);
  }
  
  @Patch(':id/view')
  @HttpCode(HttpStatus.OK)
  setView(@Req() req: any, @Param('id') id: string, @Body('view') view: string) {
    return this.projectsService.setView(req.user.id, id, view as any);
  }
}