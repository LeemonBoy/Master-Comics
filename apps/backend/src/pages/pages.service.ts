import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(chapterId: string, userId: string, imageUrl: string, pageNumber?: number) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id: chapterId }, include: { comic: true } });
    if (!chapter) throw new NotFoundException('Capítulo no encontrado');
    if (chapter.comic.authorId !== userId) throw new ForbiddenException('No autorizado');

    const pageCount = await this.prisma.page.count({ where: { chapterId } });
    const finalPageNumber = pageNumber || pageCount + 1;

    const page = await this.prisma.page.create({
      data: { chapterId, imageUrl, pageNumber: finalPageNumber },
    });

    return page;
  }

  async findMany(chapterId: string) {
    return this.prisma.page.findMany({
      where: { chapterId },
      orderBy: { pageNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Página no encontrada');
    return page;
  }

  async update(id: string, userId: string, dto: any) {
    const page = await this.prisma.page.findUnique({ where: { id }, include: { chapter: { include: { comic: true } } } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.chapter.comic.authorId !== userId) throw new ForbiddenException('No autorizado');
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const page = await this.prisma.page.findUnique({ where: { id }, include: { chapter: { include: { comic: true } } } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.chapter.comic.authorId !== userId) throw new ForbiddenException('No autorizado');
    await this.prisma.page.delete({ where: { id } });
    return { message: 'Página eliminada' };
  }

  async reorder(chapterId: string, userId: string, pageIds: string[]) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id: chapterId }, include: { comic: true } });
    if (!chapter) throw new NotFoundException('Capítulo no encontrado');
    if (chapter.comic.authorId !== userId) throw new ForbiddenException('No autorizado');

    const pages = await this.prisma.page.findMany({ where: { chapterId } });
    const pageIdsSet = new Set(pageIds);
    const orderedPages = pages.filter((p) => pageIdsSet.has(p.id)).sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));

    await this.prisma.$transaction(async (tx) => {
      for (const page of orderedPages) {
        await tx.page.update({
          where: { id: page.id },
          data: { pageNumber: -page.pageNumber },
        });
      }
      for (let i = 0; i < orderedPages.length; i++) {
        await tx.page.update({
          where: { id: orderedPages[i].id },
          data: { pageNumber: i + 1 },
        });
      }
    });

    return this.prisma.page.findMany({ where: { chapterId }, orderBy: { pageNumber: 'asc' } });
  }
}
