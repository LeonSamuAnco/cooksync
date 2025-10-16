import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthPrismaController } from './auth-prisma.controller';
import { AuthPrismaService } from './auth-prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthPrismaController],
  providers: [AuthPrismaService, JwtStrategy],
  exports: [AuthPrismaService, JwtStrategy],
})
export class AuthPrismaModule {}
