import {
  Controller,
  Post,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthPrismaService } from './auth-prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthPrismaController {
  constructor(private authPrismaService: AuthPrismaService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authPrismaService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authPrismaService.login(loginUserDto);
  }

  @Get('roles')
  getRoles() {
    return this.authPrismaService.getRoles();
  }

  @Get('document-types')
  getDocumentTypes() {
    return this.authPrismaService.getDocumentTypes();
  }

  @Get('client-plans')
  getClientPlans() {
    return this.authPrismaService.getClientPlans();
  }

  @Get('test-db')
  async testDatabase() {
    try {
      const roles = await this.authPrismaService.getRoles();
      const documentTypes = await this.authPrismaService.getDocumentTypes();
      const clientPlans = await this.authPrismaService.getClientPlans();
      
      return {
        message: 'Conexión a BD con Prisma exitosa',
        roles: roles.length,
        documentTypes: documentTypes.length,
        clientPlans: clientPlans.length,
        rolesData: roles,
        documentTypesData: documentTypes,
        clientPlansData: clientPlans,
      };
    } catch (error: any) {
      return {
        message: 'Error de conexión a BD con Prisma',
        error: error.message,
      };
    }
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    try {
      const userId = parseInt(id);
      const result = await this.authPrismaService.getUserById(userId);
      
      if (!result || !result.user) {
        return {
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        };
      }

      return result.user; // Devolver directamente el usuario, no envuelto en objeto
    } catch (error: any) {
      return {
        message: 'Error obteniendo usuario',
        error: error.message,
      };
    }
  }

  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    try {
      const userId = req.user.id;
      const result = await this.authPrismaService.updateUserProfile(userId, updateData);
      
      if (!result) {
        return {
          message: 'Error actualizando perfil',
          error: 'UPDATE_FAILED'
        };
      }

      return result; // Devolver el usuario actualizado
    } catch (error: any) {
      return {
        message: 'Error actualizando perfil',
        error: error.message,
      };
    }
  }

  @Get('profile-stats/:id')
  @UseGuards(JwtAuthGuard)
  async getProfileStats(@Param('id') id: string) {
    try {
      const userId = parseInt(id);
      const stats = await this.authPrismaService.getUserProfileStats(userId);
      
      return stats;
    } catch (error: any) {
      return {
        message: 'Error obteniendo estadísticas',
        error: error.message,
      };
    }
  }
}
