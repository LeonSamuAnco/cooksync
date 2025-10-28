import { Controller, Get, Param, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-celulares')
  testCelulares(): string {
    return 'Endpoint de prueba de celulares funciona!';
  }

  @Get('celulares/marcas')
  async getMarcas() {
    return await this.prisma.celular_marcas.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  @Get('celulares/gamas')
  async getGamas() {
    return await this.prisma.celular_gamas.findMany({
      orderBy: { gama: 'asc' },
    });
  }

  @Get('celulares/sistemas-operativos')
  async getSistemasOperativos() {
    return await this.prisma.celular_sistemas_operativos.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  @Get('celulares/recommendations')
  async getRecommendations() {
    const celulares = await this.prisma.celulares.findMany({
      where: {
        items: {
          es_activo: true,
        },
      },
      include: {
        items: true,
        celular_marcas: true,
        celular_gamas: true,
        celular_sistemas_operativos: true,
      },
      orderBy: {
        items: { fecha_creacion: 'desc' },
      },
      take: 12,
    });
    return celulares;
  }

  @Get('celulares/:id')
  async getCelularById(@Param('id', ParseIntPipe) id: number) {
    const celular = await this.prisma.celulares.findUnique({
      where: { item_id: id },
      include: {
        items: {
          include: {
            celular_camaras: {
              include: {
                celular_tipos_lente: true,
              },
            },
          },
        },
        celular_marcas: true,
        celular_gamas: true,
        celular_sistemas_operativos: true,
      },
    });

    if (!celular) {
      throw new NotFoundException(`Celular con ID ${id} no encontrado`);
    }

    return celular;
  }
}
