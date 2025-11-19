const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeporteExists() {
  try {
    console.log('🔍 Verificando deporte ID 1...\n');

    const deporte = await prisma.deportes_equipamiento.findUnique({
      where: { id: 1 },
      include: {
        deporte_marcas: true,
        deporte_tipos: true,
        deporte_equipamiento_tipos: true,
      },
    });

    if (deporte) {
      console.log('✅ Deporte encontrado:');
      console.log('📋 ID:', deporte.id);
      console.log('📋 Marca:', deporte.deporte_marcas?.nombre || 'N/A');
      console.log('📋 Tipo deporte:', deporte.deporte_tipos?.nombre || 'N/A');
      console.log('📋 Tipo equipamiento:', deporte.deporte_equipamiento_tipos?.nombre || 'N/A');
      console.log('📋 Género:', deporte.genero);
      console.log('📋 Material:', deporte.material_principal);
    } else {
      console.log('❌ Deporte con ID 1 NO encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDeporteExists();

