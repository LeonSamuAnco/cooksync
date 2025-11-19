import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsTestController } from './products-test.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsTestController, ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {
  constructor() {
  }
}
