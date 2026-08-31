import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByPlacement(placement: string) {
    const now = new Date();
    return this.prisma.advertisement.findFirst({
      where: {
        placement: placement as any,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }

  async findAll(filters: any = {}) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const [ads, total] = await Promise.all([
      this.prisma.advertisement.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.advertisement.count(),
    ]);
    return { ads, total, page, limit };
  }

  async create(dto: any) {
    return this.prisma.advertisement.create({
      data: {
        name: dto.name,
        placement: dto.placement,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.advertisement.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.placement && { placement: dto.placement }),
        ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
        ...(dto.linkUrl !== undefined && { linkUrl: dto.linkUrl }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.advertisement.delete({ where: { id } });
    return { message: 'Anuncio eliminado' };
  }

  async incrementImpression(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
  }

  async incrementClick(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }
}
