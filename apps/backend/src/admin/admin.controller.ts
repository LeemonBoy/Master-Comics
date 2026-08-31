import { Controller, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Delete('comics/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteComic(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deleteComic(id, req.user.userId);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteComment(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deleteComment(id, req.user.userId);
  }
}
