import {
  Controller, Post, Get, Delete, Patch,
  Body, Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollaborationService } from './collaboration.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { MemberRole } from './entities/project-member.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post(':id/invite')
  @HttpCode(HttpStatus.OK)
  invite(
    @Req() req: any,
    @Param('id') projectId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.collaborationService.invite(
      req.user.id, projectId, dto.email, dto.role,
    );
  }

  @Post(':id/invite-link')
  @HttpCode(HttpStatus.OK)
  generateInviteLink(@Req() req: any, @Param('id') projectId: string) {
    return this.collaborationService.generateInviteLink(req.user.id, projectId);
  }

  @Get(':id/members')
  getMembers(@Param('id') projectId: string) {
    return this.collaborationService.getMembers(projectId);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Req() req: any,
    @Param('id') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.collaborationService.removeMember(req.user.id, projectId, userId);
  }

  @Patch(':id/members/:userId/role')
  updateRole(
    @Req() req: any,
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Body('role') role: MemberRole,
  ) {
    return this.collaborationService.updateRole(req.user.id, projectId, userId, role);
  }
}