import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, dto: any) {
    return this.prisma.report.create({
      data: {
        reporterId,
        comicId: dto.comicId,
        chapterId: dto.chapterId,
        reason: dto.reason,
        description: dto.description,
      },
      include: { comic: { select: { title: true } }, reporter: { select: { username: true } } },
    });
  }

  async findMany(filters: any = {}) {
    const { page = 1, limit = 20, status } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          comic: { select: { title: true, coverImage: true } },
          reporter: { select: { username: true, email: true } },
          reviewer: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { reports, total, page, limit };
  }

  async updateStatus(id: string, status: ReportStatus, reviewerId: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status, reviewedBy: reviewerId, reviewedAt: new Date() },
      include: { comic: true, reporter: true },
    });
  }
}
