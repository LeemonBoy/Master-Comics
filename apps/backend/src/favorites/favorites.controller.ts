import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@GetUser() user: any, @Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return this.favoritesService.list(user.userId, page, limit);
  }

  @Get('comic/:comicId')
  @UseGuards(JwtAuthGuard)
  async isFavorite(@GetUser() user: any, @Param('comicId') comicId: string) {
    const fav = await this.favoritesService.isFavorite(user.userId, comicId);
    return { isFavorite: !!fav };
  }

  @Post(':comicId')
  @UseGuards(JwtAuthGuard)
  async add(@GetUser() user: any, @Param('comicId') comicId: string) {
    return this.favoritesService.add(user.userId, comicId);
  }

  @Delete(':comicId')
  @UseGuards(JwtAuthGuard)
  async remove(@GetUser() user: any, @Param('comicId') comicId: string) {
    return this.favoritesService.remove(user.userId, comicId);
  }
}
