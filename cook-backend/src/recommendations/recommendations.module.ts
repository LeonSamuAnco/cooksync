import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { AdvancedRecommendationsService } from './advanced-recommendations.service';
import { MLRecommendationsService } from './ml-recommendations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    AdvancedRecommendationsService,
    MLRecommendationsService,
  ],
  exports: [
    RecommendationsService,
    AdvancedRecommendationsService,
    MLRecommendationsService,
  ],
})
export class RecommendationsModule {}
