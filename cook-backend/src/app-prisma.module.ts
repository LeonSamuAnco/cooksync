import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthPrismaModule } from './auth/auth-prisma.module';
import { RecipesModule } from './recipes/recipes.module';
import { SearchModule } from './search/search.module';
import { UploadModule } from './upload/upload.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PantryModule } from './pantry/pantry.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityModule } from './activity/activity.module';
import { CelularesModule } from './celulares/celulares.module';
import { TortasModule } from './tortas/tortas.module';
import { LugaresModule } from './lugares/lugares.module';
import { DeportesModule } from './deportes/deportes.module';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { VendorsModule } from './vendors/vendors.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // Habilitar TypeORM para módulos que lo requieren (Admin)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_DATABASE || 'cook',
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthPrismaModule,
    RecipesModule,
    SearchModule,
    UploadModule,
    ReviewsModule,
    PantryModule,
    ShoppingListModule,
    FavoritesModule,
    NotificationsModule,
    ActivityModule,
    CelularesModule,
    TortasModule,
    LugaresModule,
    DeportesModule,
    // Registrar el módulo de administración (endpoints /admin/*)
    AdminModule,
    // Módulo de productos para CRUD de categorías
    ProductsModule,
    // Módulo de recomendaciones personalizadas
    RecommendationsModule,
    // Módulo de vendedores
    VendorsModule,
    // Módulo de logging estructurado
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppPrismaModule {}
