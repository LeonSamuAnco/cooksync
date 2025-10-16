import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppPrismaModule {}
