import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShoppingListService } from './shopping-list.service';
import { CreateShoppingItemDto } from './dto/create-shopping-item.dto';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';

@Controller('shopping-list')
@UseGuards(JwtAuthGuard)
export class ShoppingListController {
  private readonly logger = new Logger(ShoppingListController.name);

  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get('my-list')
  async getMyList(@Request() req) {
    return await this.shoppingListService.findAllByUser(req.user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createDto: CreateShoppingItemDto) {
    return await this.shoppingListService.create(req.user.userId, createDto);
  }

  @Post('generate')
  async generate(@Request() req, @Body() generateDto: GenerateShoppingListDto) {
    return await this.shoppingListService.generateFromRecipes(
      req.user.userId,
      generateDto,
    );
  }

  @Patch(':id/purchase')
  async markAsPurchased(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return await this.shoppingListService.markAsPurchased(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return await this.shoppingListService.remove(id, req.user.userId);
  }

  @Delete('clear/purchased')
  async clearPurchased(@Request() req) {
    return await this.shoppingListService.clearPurchased(req.user.userId);
  }

  @Get('stores/:ingredient')
  getSuggestedStores(@Param('ingredient') ingredient: string) {
    return this.shoppingListService.getSuggestedStores(ingredient);
  }
}
