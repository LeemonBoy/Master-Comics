import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteComic(comicId: string, adminId: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Cómic no encontrado');

    await this.prisma.adminAction.create({
      data: {
        adminId,
        targetComicId: comicId,
        action: 'DELETE_COMIC',
        reason: 'Eliminado por administrador',
      },
    });

    await this.prisma.comic.delete({ where: { id: comicId } });
    return { message: 'Cómic eliminado' };
  }

  async deleteComment(commentId: string, adminId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    await this.prisma.adminAction.create({
      data: {
        adminId,
        targetUserId: comment.userId,
        action: 'DELETE_COMMENT',
        reason: 'Eliminado por administrador',
      },
    });

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comentario eliminado' };
  }
}
