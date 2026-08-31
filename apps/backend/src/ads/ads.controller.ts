import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { AdsService } from './ads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAdDto, UpdateAdDto } from './dto/create-ad.dto';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('public/:placement')
  async publicAd(@Param('placement') placement: string) {
    return this.adsService.findActiveByPlacement(placement);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(@Request() req: any) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return this.adsService.findAll({ page, limit });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Request() req: any, @Body() dto: CreateAdDto) {
    return this.adsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.adsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
