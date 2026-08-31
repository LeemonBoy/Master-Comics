import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@GetUser() user: any, @Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return this.historyService.list(user.userId, page, limit);
  }

  @Post(':comicId/:chapterId')
  @UseGuards(JwtAuthGuard)
  async saveProgress(
    @GetUser() user: any,
    @Param('comicId') comicId: string,
    @Param('chapterId') chapterId: string,
    @Body() body: { lastPageNumber: number; totalPages: number },
  ) {
    return this.historyService.upsert(user.userId, comicId, chapterId, body.lastPageNumber, body.totalPages);
  }

  @Get('comic/:comicId')
  @UseGuards(JwtAuthGuard)
  async getProgress(@GetUser() user: any, @Param('comicId') comicId: string) {
    return this.historyService.getProgress(user.userId, comicId);
  }
}
