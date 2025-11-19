import { Controller, Get } from '@nestjs/common';

@Controller('products-test')
export class ProductsTestController {
  constructor() {
  }

  @Get()
  test() {
    return { message: 'Products module is working!' };
  }
}
