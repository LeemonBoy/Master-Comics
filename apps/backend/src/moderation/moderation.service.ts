import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminActionType } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async pendingComics(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [comics, total] = await Promise.all([
      this.prisma.comic.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        include: { author: { select: { username: true, displayName: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.comic.count({ where: { status: 'PENDING' } }),
    ]);
    return { comics, total, page, limit };
  }

  async approveComic(comicId: string, adminId: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    await this.prisma.$transaction([
      this.prisma.comic.update({ where: { id: comicId }, data: { status: 'PUBLISHED' } }),
      this.prisma.adminAction.create({
        data: { adminId, targetComicId: comicId, action: AdminActionType.APPROVE_COMIC, reason: 'Aprobado en moderación' },
      }),
    ]);

    return { message: 'Cómic aprobado' };
  }

  async rejectComic(comicId: string, adminId: string, reason: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    await this.prisma.$transaction([
      this.prisma.comic.update({ where: { id: comicId }, data: { status: 'DRAFT' } }),
      this.prisma.adminAction.create({
        data: { adminId, targetComicId: comicId, action: AdminActionType.REJECT_COMIC, reason },
      }),
    ]);

    return { message: 'Cómic rechazado' };
  }

  async hideComic(comicId: string, adminId: string, reason?: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    await this.prisma.$transaction([
      this.prisma.comic.update({ where: { id: comicId }, data: { status: 'ARCHIVED' } }),
      this.prisma.adminAction.create({
        data: { adminId, targetComicId: comicId, action: AdminActionType.HIDE_COMIC, reason: reason || 'Ocultado por moderación' },
      }),
    ]);

    return { message: 'Cómic ocultado' };
  }

  async dashboard() {
    const [
      totalUsers,
      totalComics,
      totalChapters,
      totalPages,
      pendingModeration,
      pendingReports,
      topComics,
      topCreators,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.comic.count(),
      this.prisma.chapter.count(),
      this.prisma.page.count(),
      this.prisma.comic.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.comic.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { views: 'desc' },
        select: { id: true, title: true, views: true, author: { select: { username: true } } },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, displayName: true, _count: { select: { authoredComics: true } } },
      }),
    ]);

    return {
      stats: { totalUsers, totalComics, totalChapters, totalPages, pendingModeration, pendingReports },
      topComics,
      topCreators,
    };
  }
}
