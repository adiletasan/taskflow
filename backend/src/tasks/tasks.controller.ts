import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService,private readonly commentsService: CommentsService,) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('projectId') projectId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('completed') completed?: string,
  ) {
    return this.tasksService.findAll(req.user.id, {
      projectId,
      sectionId,
      completed: completed !== undefined ? completed === 'true' : undefined,
      parentTaskId: null, // только корневые
    });
  }

  @Get('today')
  findToday(@Req() req: any) {
    return this.tasksService.findToday(req.user.id);
  }

  @Get('upcoming')
  findUpcoming(@Req() req: any) {
    return this.tasksService.findUpcoming(req.user.id);
  }

  @Get('search')
  search(@Req() req: any, @Query('q') q: string) {
    return this.tasksService.search(req.user.id, q);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(req.user.id, id, dto);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.complete(req.user.id, id);
  }

  @Patch(':id/reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@Req() req: any, @Param('id') id: string, @Body() dto: ReorderTaskDto) {
    return this.tasksService.reorder(req.user.id, id, dto.order);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.remove(req.user.id, id);
  }

  @Post(':id/labels/:labelId')
  @HttpCode(HttpStatus.OK)
  addLabel(
    @Req() req: any,
    @Param('id') id: string,
    @Param('labelId') labelId: string,
  ) {
    return this.tasksService.addLabel(req.user.id, id, labelId);
  }


  @Delete(':id/labels/:labelId')
  @HttpCode(HttpStatus.OK)
  removeLabel(
    @Req() req: any,
    @Param('id') id: string,
    @Param('labelId') labelId: string,
  ) {
    return this.tasksService.removeLabel(req.user.id, id, labelId);
  }

  // ─── Комментарии ──────────────────────────────────────────────
  @Post(':id/comments')
  createComment(
    @Req() req: any,
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
  ){
    return this.commentsService.create(req.user.id, taskId, dto);
  }

  @Get(':id/comments')
  getComments(@Param('id') taskId: string) {
    return this.commentsService.findAll(taskId);
  }

  @Patch(':id/comments/:commentId')
  updateComment(
    @Req() req: any,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ){
    return this.commentsService.update(req.user.id, commentId, dto);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  removeComment(
    @Req() req: any,
    @Param('commentId') commentId: string,
  ){
    return this.commentsService.remove(req.user.id, commentId);
  }


  // ─── История активности ───────────────────────────────────────
  @Get(':id/activity')
  getActivity(@Param('id') taskId: string) {
    return this.commentsService.getActivity(taskId);
  }

  // ─── Дублирование ─────────────────────────────────────────────
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.OK)
  duplicate(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.duplicate(req.user.id, id);
  }


}