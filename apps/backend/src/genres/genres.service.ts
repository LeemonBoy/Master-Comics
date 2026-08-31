import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.genre.findUnique({ where: { id } });
  }

  async create(dto: { name: string; description?: string }) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.genre.create({
      data: { name: dto.name, slug, description: dto.description },
    });
  }
}
