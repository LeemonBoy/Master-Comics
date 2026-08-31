import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, comicId: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    const existing = await this.prisma.userFavorite.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });
    if (existing) throw new ConflictException('Ya está en favoritos');

    return this.prisma.userFavorite.create({
      data: { userId, comicId },
      include: { comic: true },
    });
  }

  async remove(userId: string, comicId: string) {
    const existing = await this.prisma.userFavorite.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });
    if (!existing) throw new NotFoundException('No está en favoritos');

    await this.prisma.userFavorite.delete({
      where: { userId_comicId: { userId, comicId } },
    });
    return { message: 'Eliminado de favoritos' };
  }

  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [favorites, total] = await Promise.all([
      this.prisma.userFavorite.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { comic: { include: { author: true, genres: { include: { genre: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userFavorite.count({ where: { userId } }),
    ]);
    return { favorites, total, page, limit };
  }

  async isFavorite(userId: string, comicId: string) {
    return this.prisma.userFavorite.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });
  }
}
