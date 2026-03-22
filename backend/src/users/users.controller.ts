import {
  Controller, Get, Patch, Delete,
  Body, Req, Res, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() body: { name?: string; avatarUrl?: string }) {
    return this.usersService.update(req.user.id, body);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteMe(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.deleteAccount(req.user.id);
    res.clearCookie('refresh_token');
    return { message: 'Аккаунт удалён' };
  }
}
