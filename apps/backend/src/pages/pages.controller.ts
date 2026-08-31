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
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { StorageService } from '../storage/storage.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService, private readonly storageService: StorageService) {}

  @Get('chapter/:chapterId')
  async findByChapter(@Param('chapterId') chapterId: string) {
    return this.pagesService.findMany(chapterId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Post('chapter/:chapterId')
  @UseGuards(JwtAuthGuard)
  async create(@GetUser() user: any, @Param('chapterId') chapterId: string, @Body() dto: CreatePageDto) {
    return this.pagesService.create(chapterId, user.userId, dto.imageUrl, dto.pageNumber);
  }

  @Post('chapter/:chapterId/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 50))
  async upload(@GetUser() user: any, @Param('chapterId') chapterId: string, @UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
    if (!files || files.length === 0) throw new BadRequestException('Archivos requeridos');
    const uploaded = [];
    for (const file of files) {
      if (!this.storageService.validateImageMagicBytes(file.buffer)) {
        throw new BadRequestException('Tipo de archivo no permitido');
      }
      const path = await this.storageService.compressAndSave(file);
      const fullUrl = `${req.protocol}://${req.get('host')}${path}`;
      const page = await this.pagesService.create(chapterId, user.userId, fullUrl);
      uploaded.push(page);
    }
    return uploaded;
  }

  @Post('chapter/:chapterId/reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(@GetUser() user: any, @Param('chapterId') chapterId: string, @Body() body: any) {
    const pageIds = body.pageIds;
    if (!Array.isArray(pageIds)) throw new BadRequestException('pageIds requerido');
    return this.pagesService.reorder(chapterId, user.userId, pageIds);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@GetUser() user: any, @Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@GetUser() user: any, @Param('id') id: string) {
    return this.pagesService.remove(id, user.userId);
  }
}
