import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(comicId: string, userId: string, dto: any) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');
    if (comic.authorId !== userId) throw new ForbiddenException('No autorizado');

    const lastChapter = await this.prisma.chapter.findFirst({
      where: { comicId },
      orderBy: { chapterNumber: 'desc' },
    });

    return this.prisma.chapter.create({
      data: {
        comicId,
        title: dto.title,
        chapterNumber: dto.chapterNumber || (lastChapter ? lastChapter.chapterNumber + 1 : 1),
        coverImage: dto.coverImage,
        isPublished: dto.isPublished || false,
      },
    });
  }

  async findMany(comicId: string) {
    return this.prisma.chapter.findMany({
      where: { comicId },
      orderBy: { chapterNumber: 'asc' },
      include: { pages: { orderBy: { pageNumber: 'asc' } }, _count: { select: { pages: true } } },
    });
  }

  async findOne(id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { comic: true, pages: true },
    });
    if (!chapter) throw new NotFoundException('Capítulo no encontrado');
    return chapter;
  }

  async update(id: string, userId: string, dto: any) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id }, include: { comic: true } });
    if (!chapter) throw new NotFoundException('Capítulo no encontrado');
    if (chapter.comic.authorId !== userId) throw new ForbiddenException('No autorizado');
    return this.prisma.chapter.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id }, include: { comic: true } });
    if (!chapter) throw new NotFoundException('Capítulo no encontrado');
    if (chapter.comic.authorId !== userId) throw new ForbiddenException('No autorizado');
    await this.prisma.chapter.delete({ where: { id } });
    return { message: 'Capítulo eliminado' };
  }

  async reorder(comicId: string, userId: string, chapterIds: string[]) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');
    if (comic.authorId !== userId) throw new ForbiddenException('No autorizado');

    for (let i = 0; i < chapterIds.length; i++) {
      await this.prisma.chapter.update({
        where: { id: chapterIds[i] },
        data: { chapterNumber: i + 1 },
      });
    }
    return this.prisma.chapter.findMany({ where: { comicId }, orderBy: { chapterNumber: 'asc' } });
  }
}
