import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateChapterDto, UpdateChapterDto } from './dto/create-chapter.dto';
import { StorageService } from '../storage/storage.service';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService, private readonly storageService: StorageService) {}

  @Get('comic/:comicId')
  async findByComic(@Param('comicId') comicId: string) {
    return this.chaptersService.findMany(comicId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @Post('comic/:comicId')
  @UseGuards(JwtAuthGuard)
  async create(@GetUser() user: any, @Param('comicId') comicId: string, @Body() dto: CreateChapterDto) {
    return this.chaptersService.create(comicId, user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@GetUser() user: any, @Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.chaptersService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@GetUser() user: any, @Param('id') id: string) {
    return this.chaptersService.remove(id, user.userId);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@GetUser() user: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    if (!this.storageService.validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }
    const url = await this.storageService.compressAndSave(file);
    return this.chaptersService.update(id, user.userId, { coverImage: url });
  }
}
