import { Module } from '@nestjs/common';
import { TortasController } from './tortas.controller';
import { TortasService } from './tortas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TortasController],
  providers: [TortasService],
  exports: [TortasService],
})
export class TortasModule {}
