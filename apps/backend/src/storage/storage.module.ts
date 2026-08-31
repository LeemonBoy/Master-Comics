import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024),
      },
      fileFilter: (req, file, cb) => {
        const allowed = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido'), false);
        }
      },
    }),
  ],
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}
