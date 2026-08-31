import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async findMany(@Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    return this.reportsService.findMany({ page, limit, status });
  }

  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async resolve(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.updateStatus(id, 'RESOLVED', req.user.userId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  async reject(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.updateStatus(id, 'REJECTED', req.user.userId);
  }
}
