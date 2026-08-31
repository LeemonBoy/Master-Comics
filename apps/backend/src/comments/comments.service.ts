import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, comicId: string, content: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    return this.prisma.comment.create({
      data: { userId, comicId, content },
      include: { user: { select: { username: true, displayName: true, avatar: true } } },
    });
  }

  async findByComic(comicId: string) {
    return this.prisma.comment.findMany({
      where: { comicId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, displayName: true, avatar: true } } },
    });
  }

  async findMany(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, displayName: true, avatar: true } },
          comic: { select: { id: true, title: true } },
        },
      }),
      this.prisma.comment.count(),
    ]);
    return { comments, total, page, limit };
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');
    if (comment.userId !== userId) throw new NotFoundException('No autorizado');

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comentario eliminado' };
  }
}
