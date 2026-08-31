import { Controller, Get, Param, Patch, Delete, UseGuards, Request, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@GetUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@GetUser() user: any, @Body() dto: any) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async list(@Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return this.usersService.listUsers(page, limit);
  }

  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async suspend(@Request() req: any, @Param('id') id: string) {
    return this.usersService.suspendUser(id);
  }

  @Post(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async reactivate(@Request() req: any, @Param('id') id: string) {
    return this.usersService.reactivateUser(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
