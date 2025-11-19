import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppPrismaModule } from './app-prisma.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppPrismaModule);

  // Configurar CORS - Permitir múltiples orígenes
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // URLs del frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe());

  // Servir archivos estáticos (imágenes)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
}
bootstrap();
