import { Controller, Get, Post, Param, Delete, UseGuards, Request, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user.userId, dto.comicId, dto.content);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findMany(@Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    return this.commentsService.findMany(page, limit);
  }

  @Get('comic/:comicId')
  async findByComic(@Param('comicId') comicId: string) {
    return this.commentsService.findByComic(comicId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.commentsService.remove(id, req.user.userId);
  }
}
