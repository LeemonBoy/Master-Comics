import { Controller, Get, Param, Post, Patch, Delete, Body, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException, Query, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComicsService } from './comics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateComicDto, UpdateComicDto } from './dto/create-comic.dto';
import { StorageService } from '../storage/storage.service';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService, private readonly storageService: StorageService) {}

  @Get()
  async findMany(@Query() query: any) {
    return this.comicsService.findMany(query);
  }

  @Get('popular')
  async popular(@Query('limit') limit?: string) {
    return this.comicsService.popular(limit ? parseInt(limit) : 10);
  }

  @Get('recent')
  async recent(@Query('limit') limit?: string) {
    return this.comicsService.recent(limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.comicsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@GetUser() user: any, @Body() dto: CreateComicDto) {
    return this.comicsService.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@GetUser() user: any, @Param('id') id: string, @Body() dto: UpdateComicDto) {
    return this.comicsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@GetUser() user: any, @Param('id') id: string) {
    return this.comicsService.remove(id, user.userId);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@GetUser() user: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Archivo requerido');
    if (!this.storageService.validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }
    const path = await this.storageService.compressAndSave(file);
    const fullUrl = `${req.protocol}://${req.get('host')}${path}`;
    const updated = await this.comicsService.update(id, user.userId, { coverImage: fullUrl });
    return { coverImage: updated.coverImage };
  }

  @Post(':id/views')
  async incrementViews(@Param('id') id: string) {
    return this.comicsService.incrementViews(id);
  }
}
