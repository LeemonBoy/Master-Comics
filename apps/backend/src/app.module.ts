import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ComicsModule } from './comics/comics.module';
import { ChaptersModule } from './chapters/chapters.module';
import { PagesModule } from './pages/pages.module';
import { GenresModule } from './genres/genres.module';
import { TagsModule } from './tags/tags.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { HistoryModule } from './history/history.module';
import { ModerationModule } from './moderation/moderation.module';
import { ReportsModule } from './reports/reports.module';
import { AdsModule } from './ads/ads.module';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health/health.controller';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ComicsModule,
    ChaptersModule,
    PagesModule,
    GenresModule,
    TagsModule,
    FavoritesModule,
    LikesModule,
    CommentsModule,
    HistoryModule,
    ModerationModule,
    ReportsModule,
    AdsModule,
    StorageModule,
    AdminModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
