import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdsModule } from '../ads/ads.module';

@Module({
  imports: [PrismaModule, AdsModule],
  providers: [ModerationService],
  controllers: [ModerationController],
  exports: [ModerationService],
})
export class ModerationModule {}
