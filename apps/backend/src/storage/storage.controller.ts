import { Controller, Get, Param, Post, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('url/:filename')
  @UseGuards(JwtAuthGuard)
  getUrl(@Request() req: any, @Param('filename') filename: string) {
    const url = this.storageService.getPublicUrl(filename);
    return { url: `${req.protocol}://${req.get('host')}${url}` };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    if (!this.storageService.validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }
    const filename = file.originalname || 'avatar.jpg';
    const relativeUrl = await this.storageService.saveBuffer(file.buffer, filename);
    return { url: `${req.protocol}://${req.get('host')}${relativeUrl}` };
  }
}
