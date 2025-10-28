import { Module, MiddlewareConsumer, NestModule, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';
import { AuthPrismaModule } from './auth/auth-prisma.module';
import { ClientsModule } from './clients/clients.module';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { VendorsModule } from './vendors/vendors.module';
import { PrismaModule } from './prisma/prisma.module';
import { CelularesModule } from './celulares/celulares.module';
import { TortasModule } from './tortas/tortas.module';
import { LugaresModule } from './lugares/lugares.module';
import { SecurityMiddleware } from './common/middleware/security.middleware';

const logger = new Logger('AppModule');
logger.log('🔍 Importando CelularesModule, TortasModule y LugaresModule...');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
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
    RecipesModule,
    AuthPrismaModule,
    ClientsModule,
    AdminModule,
    ProductsModule,
    VendorsModule,
    CelularesModule,
    TortasModule,
    LugaresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor() {
    logger.log('✅ AppModule constructor - CelularesModule debería estar cargado');
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
