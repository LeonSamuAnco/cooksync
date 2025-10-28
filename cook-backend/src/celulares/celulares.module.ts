import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { CelularesController } from './celulares.controller';
import { CelularesService } from './celulares.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CelularesController],
  providers: [CelularesService],
  exports: [CelularesService],
})
export class CelularesModule implements OnModuleInit {
  private readonly logger = new Logger(CelularesModule.name);

  onModuleInit() {
    this.logger.log('🚀 ========================================');
    this.logger.log('🚀 CELULARES MODULE INITIALIZED');
    this.logger.log('🚀 ========================================');
  }
}

