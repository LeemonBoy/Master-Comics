import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComicsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, dto: any) {
    return this.prisma.comic.create({
      data: {
        title: dto.title,
        description: dto.description,
        authorId: userId,
        artistId: dto.artistId || userId,
        ageRating: dto.ageRating,
        language: dto.language || 'es',
        coverImage: dto.coverImage,
        status: dto.status || 'DRAFT',
        genres: dto.genreIds ? { create: dto.genreIds.map((id: string) => ({ genreId: id })) } : undefined,
        tags: dto.tagIds
          ? { create: dto.tagIds.map((id: string) => ({ tagId: id })) }
          : undefined,
      },
      include: { genres: { include: { genre: true } }, tags: { include: { tag: true } } },
    });
  }

  async findMany(filters: any = {}) {
    const { page = 1, limit = 20, search, genre, tag, sort = 'createdAt_DESC', authorId, all } = filters;
    const skip = (page - 1) * limit;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const where: any = {};

    if (!all && !authorId) {
      where.status = 'PUBLISHED';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (genre) {
      where.genres = { some: { genre: { slug: genre } } };
    }
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }
    if (authorId && authorId !== 'me') {
      where.authorId = authorId;
    }

    const orderBy: any = {};
    const [field, direction] = sort.split('_');
    orderBy[field] = direction.toLowerCase();

    const [comics, total] = await Promise.all([
      this.prisma.comic.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
          genres: { include: { genre: true } },
          tags: { include: { tag: true } },
          chapters: { where: { isPublished: true }, select: { id: true } },
          _count: { select: { favorites: true, history: true } },
        },
      }),
      this.prisma.comic.count({ where }),
    ]);

    return { comics, total, page, limit: limitNum };
  }

  async findOne(id: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
        artist: { select: { id: true, username: true, displayName: true } },
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        chapters: { where: { isPublished: true }, orderBy: { chapterNumber: 'asc' } },
        _count: { select: { favorites: true, history: true } },
      },
    });
    if (!comic) throw new NotFoundException('Cómic no encontrado');
    return comic;
  }

  async update(id: string, userId: string, dto: any) {
    const comic = await this.prisma.comic.findUnique({ where: { id } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');
    if (comic.authorId !== userId) throw new ForbiddenException('No autorizado');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.artistId !== undefined) data.artistId = dto.artistId;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.ageRating !== undefined) data.ageRating = dto.ageRating;
    if (dto.language !== undefined) data.language = dto.language;

    if (dto.genreIds) {
      await this.prisma.comicGenre.deleteMany({ where: { comicId: id } });
      data.genres = { create: dto.genreIds.map((gid: string) => ({ genreId: gid })) };
    }

    if (dto.tagIds) {
      await this.prisma.comicTag.deleteMany({ where: { comicId: id } });
      data.tags = { create: dto.tagIds.map((tid: string) => ({ tagId: tid })) };
    }

    return this.prisma.comic.update({
      where: { id },
      data,
      include: { genres: { include: { genre: true } }, tags: { include: { tag: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');
    if (comic.authorId !== userId) throw new ForbiddenException('No autorizado');
    await this.prisma.comic.delete({ where: { id } });
    return { message: 'Cómic eliminado' };
  }

  async incrementViews(id: string) {
    return this.prisma.comic.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async popular(limit = 10) {
    return this.prisma.comic.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { views: 'desc' },
      include: {
        author: { select: { id: true, username: true, displayName: true } },
        genres: { include: { genre: true } },
      },
    });
  }

  async recent(limit = 10) {
    return this.prisma.comic.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, displayName: true } },
        genres: { include: { genre: true } },
      },
    });
  }

  async byAuthor(authorId: string) {
    return this.prisma.comic.findMany({
      where: { authorId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: { genres: { include: { genre: true } } },
    });
  }
}
