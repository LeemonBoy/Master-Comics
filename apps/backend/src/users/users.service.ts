import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { authoredComics: true, favorites: true, history: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: { select: { authoredComics: true, favorites: true, history: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, data: { displayName?: string; bio?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { authoredComics: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async suspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async reactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
