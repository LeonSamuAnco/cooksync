import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        rol: true,
        tipoDocumento: true,
        cliente: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user || !user.esActivo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Devolver la estructura completa del usuario para que esté disponible en req.user
    const { passwordHash, tokenVerificacion, tokenRecuperacion, ...userSafe } = user;

    return {
      ...userSafe, // Incluir todos los campos del usuario
      // Agregar aliases para compatibilidad
      userId: user.id,
      sub: user.id,
      role: user.rol, // Alias para compatibilidad
      documentType: user.tipoDocumento, // Alias para compatibilidad
      client: user.cliente, // Alias para compatibilidad
    };
  }
}
