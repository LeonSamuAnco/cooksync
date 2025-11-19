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
        token: this.jwtService.sign(payload),
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
    try {
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
    } catch (error) {
      console.error('Error en getUserById:', error);
      return null;
    }
  }

  async updateUserProfile(userId: number, updateData: any) {
    try {

      // Preparar datos para actualización
      const updateFields: any = {};
      
      if (updateData.nombres) updateFields.nombres = updateData.nombres;
      if (updateData.apellidos) updateFields.apellidos = updateData.apellidos;
      if (updateData.email) updateFields.email = updateData.email;
      if (updateData.telefono) updateFields.telefono = updateData.telefono;
      if (updateData.fechaNacimiento) updateFields.fechaNacimiento = new Date(updateData.fechaNacimiento);
      if (updateData.direccion) updateFields.direccion = updateData.direccion;
      if (updateData.bio) updateFields.bio = updateData.bio;
      if (updateData.fotoPerfil) updateFields.fotoPerfil = updateData.fotoPerfil;
      if (updateData.ciudad) updateFields.ciudad = updateData.ciudad;
      if (updateData.pais) updateFields.pais = updateData.pais;

      // Actualizar contraseña si se proporciona
      if (updateData.password && updateData.password.trim() !== '') {
        const bcrypt = require('bcrypt');
        updateFields.passwordHash = await bcrypt.hash(updateData.password, 10);
      }

      // Actualizar usuario
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateFields,
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

      // Remover información sensible
      const { passwordHash, tokenVerificacion, tokenRecuperacion, ...userSafe } = updatedUser;

      // Normalizar nombres de relaciones
      const normalizedUser = {
        ...userSafe,
        rol: userSafe.rol,
        role: userSafe.rol, // Alias para compatibilidad
        tipoDocumento: userSafe.tipoDocumento,
        documentType: userSafe.tipoDocumento, // Alias para compatibilidad
        cliente: userSafe.cliente,
        client: userSafe.cliente, // Alias para compatibilidad
      };

      return normalizedUser;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  async getUserProfileStats(userId: number) {
    try {

      // Obtener actividades del usuario
      const activities = await this.prisma.userActivity.findMany({
        where: { usuarioId: userId },
        orderBy: { fecha: 'desc' },
      });

      // Calcular puntos basados en actividades
      let puntos = 0;
      const puntosPorActividad = {
        RECETA_VISTA: 1,
        RECETA_PREPARADA: 5,
        COMPRA_REALIZADA: 3,
        RESENA_PUBLICADA: 2,
        FAVORITO_AGREGADO: 1,
        PERFIL_ACTUALIZADO: 1,
        LOGIN: 1,
      };

      activities.forEach(activity => {
        puntos += puntosPorActividad[activity.tipo] || 0;
      });

      // Calcular nivel (cada 100 puntos = 1 nivel)
      const nivel = Math.floor(puntos / 100) + 1;

      // Calcular racha (días consecutivos con actividad)
      let racha = 0;
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const actividadesPorDia = {};
      activities.forEach(activity => {
        const fecha = new Date(activity.fecha);
        fecha.setHours(0, 0, 0, 0);
        const fechaStr = fecha.toISOString().split('T')[0];
        if (!actividadesPorDia[fechaStr]) {
          actividadesPorDia[fechaStr] = 0;
        }
        actividadesPorDia[fechaStr]++;
      });

      // Contar días consecutivos desde hoy hacia atrás
      for (let i = 0; i < 365; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        if (actividadesPorDia[fechaStr] && actividadesPorDia[fechaStr] > 0) {
          racha++;
        } else {
          break;
        }
      }

      // Obtener estadísticas de favoritos
      const favoritos = await this.prisma.favorite.findMany({
        where: { usuarioId: userId },
      });

      // Obtener recetas preparadas
      const recetasPreparadas = activities.filter(a => a.tipo === 'RECETA_PREPARADA').length;

      // Obtener recetas favoritas
      const recetasFavoritas = favoritos.filter(f => f.tipo === 'receta').length;

      const stats = {
        puntos,
        nivel,
        racha,
        totalActividades: activities.length,
        recetasPreparadas,
        recetasFavoritas,
        totalFavoritos: favoritos.length,
        ultimaActividad: activities[0]?.fecha || null,
        actividadesRecientes: activities.slice(0, 5).map(a => ({
          tipo: a.tipo,
          descripcion: a.descripcion,
          fecha: a.fecha,
        })),
      };

      return stats;
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      // Devolver estadísticas por defecto en caso de error
      return {
        puntos: 0,
        nivel: 1,
        racha: 0,
        totalActividades: 0,
        recetasPreparadas: 0,
        recetasFavoritas: 0,
        totalFavoritos: 0,
        ultimaActividad: null,
        actividadesRecientes: [],
      };
    }
  }
}
