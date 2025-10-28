import { Module } from '@nestjs/common';
import { DeportesController } from './deportes.controller';
import { DeportesService } from './deportes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeportesController],
  providers: [DeportesService],
  exports: [DeportesService],
})
export class DeportesModule {}
