import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { User } from '../auth/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [VendorsController],
  providers: [VendorsService, PrismaService],
  exports: [VendorsService],
})
export class VendorsModule {}
