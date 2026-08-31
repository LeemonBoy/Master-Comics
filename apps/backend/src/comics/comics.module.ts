import { Module } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ChaptersModule } from '../chapters/chapters.module';
import { GenresModule } from '../genres/genres.module';
import { TagsModule } from '../tags/tags.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [PrismaModule, StorageModule, ChaptersModule, GenresModule, TagsModule, FavoritesModule, HistoryModule],
  providers: [ComicsService],
  controllers: [ComicsController],
  exports: [ComicsService],
})
export class ComicsModule {}
