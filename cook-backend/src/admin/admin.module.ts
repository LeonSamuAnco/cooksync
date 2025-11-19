import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { DocumentType } from '../auth/entities/document-type.entity';
import { Client } from '../auth/entities/client.entity';
import { ClientPlan } from '../auth/entities/client-plan.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RecipesPrismaService } from '../recipes/recipes-prisma.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, DocumentType, Client, ClientPlan])],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard, RecipesPrismaService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}
