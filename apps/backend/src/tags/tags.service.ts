import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async create(dto: { name: string }) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.tag.create({ data: { name: dto.name, slug } });
  }
}
