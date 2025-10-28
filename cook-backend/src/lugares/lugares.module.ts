import { Module, Logger } from '@nestjs/common';
import { LugaresController } from './lugares.controller';
import { LugaresService } from './lugares.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LugaresController],
  providers: [LugaresService],
  exports: [LugaresService],
})
export class LugaresModule {
  private readonly logger = new Logger(LugaresModule.name);

  constructor() {
    this.logger.log('🔥 LugaresModule inicializado correctamente');
  }
}
