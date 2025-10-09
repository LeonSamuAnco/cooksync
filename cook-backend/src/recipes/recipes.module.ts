import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesPrismaService } from './recipes-prisma.service';
import { RolesPrismaGuard } from '../auth/guards/roles-prisma.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecipesController],
  providers: [RecipesPrismaService, RolesPrismaGuard],
  exports: [RecipesPrismaService],
})
export class RecipesModule {}
