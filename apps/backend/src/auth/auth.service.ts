import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException('Email o username ya registrados');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        displayName: dto.displayName || dto.username,
      },
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
      },
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'refreshsecret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );

    return { user, accessToken, refreshToken };
  }

  async isUsernameTaken(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    return !!user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta suspendida');
    }
    const { passwordHash, ...result } = user as any;
    return result;
  }

  async login(dto: any) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'refreshsecret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );

    const { passwordHash, ...safeUser } = user as any;
    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshsecret',
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException();
      }
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }
      const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { secret: process.env.JWT_REFRESH_SECRET || 'refreshsecret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
      );
      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(refreshToken: string) {
    // En producción, agregar token a blacklist en Redis
    return { message: 'Sesión cerrada' };
  }
}
