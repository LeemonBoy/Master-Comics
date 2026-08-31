import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, comicId: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    const existing = await this.prisma.like.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });

    let liked = false;
    if (existing) {
      await this.prisma.like.delete({ where: { userId_comicId: { userId, comicId } } });
    } else {
      await this.prisma.like.create({
        data: { userId, comicId },
      });
      liked = true;
    }

    const count = await this.prisma.like.count({ where: { comicId } });
    return { liked, count };
  }

  async count(comicId: string) {
    return this.prisma.like.count({ where: { comicId } });
  }

  async findByUser(userId: string, comicId: string) {
    return this.prisma.like.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });
  }

  async listByComic(comicId: string) {
    return this.prisma.like.findMany({
      where: { comicId },
      include: { user: { select: { username: true, displayName: true } } },
    });
  }
}
