import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, comicId: string, chapterId: string, lastPageNumber: number, totalPages: number) {
    const progress = totalPages > 0 ? lastPageNumber / totalPages : 0;
    return this.prisma.readingHistory.upsert({
      where: {
        userId_comicId_chapterId: {
          userId,
          comicId,
          chapterId,
        },
      },
      update: { lastPageNumber, progress, lastReadAt: new Date() },
      create: { userId, comicId, chapterId, lastPageNumber, progress },
    });
  }

  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
      this.prisma.readingHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { comic: { include: { author: true } } },
        orderBy: { lastReadAt: 'desc' },
      }),
      this.prisma.readingHistory.count({ where: { userId } }),
    ]);
    return { history, total, page, limit };
  }

  async getProgress(userId: string, comicId: string) {
    return this.prisma.readingHistory.findMany({
      where: { userId, comicId },
      include: { comic: true },
      orderBy: { lastReadAt: 'desc' },
    });
  }
}
