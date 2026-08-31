import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async pending(@Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return this.moderationService.pendingComics(page, limit);
  }

  @Post('comic/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async approve(@Request() req: any, @Param('id') id: string) {
    return this.moderationService.approveComic(id, req.user.userId);
  }

  @Post('comic/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async reject(@Request() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.moderationService.rejectComic(id, req.user.userId, body.reason);
  }

  @Post('comic/:id/hide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async hide(@Request() req: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.moderationService.hideComic(id, req.user.userId, body.reason);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async dashboard() {
    return this.moderationService.dashboard();
  }
}
