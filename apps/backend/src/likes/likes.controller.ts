import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':comicId')
  @UseGuards(JwtAuthGuard)
  async toggle(@Request() req: any, @Param('comicId') comicId: string) {
    return this.likesService.toggle(req.user.userId, comicId);
  }

  @Get('comic/:comicId')
  async count(@Param('comicId') comicId: string) {
    const count = await this.likesService.count(comicId);
    return { count };
  }

  @Get('comic/:comicId/me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any, @Param('comicId') comicId: string) {
    const existing = await this.likesService.findByUser(req.user.userId, comicId);
    return { liked: !!existing };
  }

  @Get('comic/:comicId/list')
  async list(@Param('comicId') comicId: string) {
    return this.likesService.listByComic(comicId);
  }
}
