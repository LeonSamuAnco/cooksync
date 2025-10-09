import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthPrismaService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const {
      email,
      password,
      nombres,
      apellidos,
      tipoDocumentoId,
      numeroDocumento,
      telefono,
      fechaNacimiento,
      genero,
      rolId,
      aceptaTerminos,
      aceptaMarketing,
    } = registerUserDto;

    // Verificar si el email ya existe
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    // Verificar si el documento ya existe
    const existingDocument = await this.prisma.user.findFirst({
      where: {
        tipoDocumentoId,
        numeroDocumento,
      },
    });
    if (existingDocument) {
      throw new ConflictException('El número de documento ya está registrado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // Usar transacción de Prisma para crear usuario y cliente
      const result = await this.prisma.$transaction(async (prisma) => {
        // Crear el usuario
        const newUser = await prisma.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            rolId: rolId || 1,
            tipoDocumentoId,
            numeroDocumento,
            nombres,
            apellidos,
            telefono,
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
            genero: genero || 'O',
            aceptaTerminos: aceptaTerminos || false,
            aceptaMarketing: aceptaMarketing || false,
            emailVerificado: false,
            telefonoVerificado: false,
            esActivo: true,
            intentosLogin: 0,
          },
        });

        // Solo crear cliente si el rol es Cliente (rolId = 1)
        if (rolId === 1 || !rolId) {
          await prisma.client.create({
            data: {
              usuarioId: newUser.id,
              planClienteId: 1, // Plan BASICO por defecto (id: 1)
              fechaRegistro: new Date(),
              puntosFidelidad: 0,
              nivelCliente: 'BRONCE',
              limiteCredito: 0,
              creditoUsado: 0,
              descuentoPersonalizado: 0,
            },
          });
        }

        return newUser;
      });

      // Excluir el password del resultado
      const { passwordHash, ...userResult } = result;
      return {
        ...userResult,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error: any) {
      console.error('Error en registro:', error);

      // Manejo específico de errores de Prisma
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          throw new ConflictException('El correo electrónico ya está en uso');
        }
        if (field === 'uk_documento') {
          throw new ConflictException(
            'El número de documento ya está registrado',
          );
        }
      }

      throw new InternalServerErrorException(
        `Error al crear el usuario: ${error.message}`,
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
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

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // Actualizar último acceso
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ultimoAcceso: new Date(),
          // ipUltimoAcceso: req.ip, // Puedes agregar esto si tienes acceso al request
        },
      });

      const payload = {
        sub: user.id,
        email: user.email,
        rol: user.rol.codigo,
      };

      const { passwordHash, ...userResult } = user;

      return {
        access_token: this.jwtService.sign(payload),
        user: userResult,
      };
    } else {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  async getRoles() {
    return this.prisma.role.findMany({
      where: { esActivo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getDocumentTypes() {
    return this.prisma.documentType.findMany({
      where: { esActivo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getClientPlans() {
    return this.prisma.clientPlan.findMany({
      where: { esActivo: true },
      orderBy: { ordenMostrar: 'asc' },
    });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return null;
    }

    // Remover información sensible y normalizar nombres de relaciones
    const { passwordHash, tokenVerificacion, tokenRecuperacion, ...userSafe } = user;

    // Asegurar que las relaciones tengan los nombres esperados por el frontend
    const normalizedUser = {
      ...userSafe,
      // Mantener tanto los nombres originales como los esperados para compatibilidad
      rol: userSafe.rol,
      role: userSafe.rol, // Alias para compatibilidad
      tipoDocumento: userSafe.tipoDocumento,
      documentType: userSafe.tipoDocumento, // Alias para compatibilidad
      cliente: userSafe.cliente,
      client: userSafe.cliente, // Alias para compatibilidad
    };

    return {
      success: true,
      user: normalizedUser,
    };
  }
}
