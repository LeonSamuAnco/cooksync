const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCelularesData() {
  try {
    console.log('🔍 Verificando datos de celulares...\n');

    // Verificar si existen celulares
    const celulares = await prisma.celulares.findMany({
      take: 5,
      include: {
        celular_marcas: true,
        celular_sistemas_operativos: true,
        celular_gamas: true,
      },
    });

    console.log(`📱 Total de celulares encontrados: ${celulares.length}`);
    
    if (celulares.length > 0) {
      console.log('\n📋 Primeros celulares:');
      celulares.forEach((celular, index) => {
        console.log(`${index + 1}. ID: ${celular.id} - ${celular.celular_marcas?.nombre || 'Sin marca'} ${celular.modelo}`);
        console.log(`   RAM: ${celular.memoria_ram_gb}GB, Almacenamiento: ${celular.almacenamiento_interno_gb}GB`);
        console.log(`   SO: ${celular.celular_sistemas_operativos?.nombre || 'N/A'}`);
        console.log(`   Gama: ${celular.celular_gamas?.gama || 'N/A'}\n`);
      });
    } else {
      console.log('❌ No se encontraron celulares en la base de datos');
    }

    // Verificar si existe el celular con ID 39 específicamente
    const celular39 = await prisma.celulares.findUnique({
      where: { id: 39 },
      include: {
        celular_marcas: true,
        celular_sistemas_operativos: true,
        celular_gamas: true,
      },
    });

    if (celular39) {
      console.log('✅ Celular con ID 39 encontrado:');
      console.log(`   Marca: ${celular39.celular_marcas?.nombre || 'N/A'}`);
      console.log(`   Modelo: ${celular39.modelo}`);
      console.log(`   RAM: ${celular39.memoria_ram_gb}GB`);
      console.log(`   Almacenamiento: ${celular39.almacenamiento_interno_gb}GB`);
    } else {
      console.log('❌ Celular con ID 39 NO encontrado');
    }

    // Verificar otros tipos también
    console.log('\n🔍 Verificando otros tipos...');
    
    const tortas = await prisma.tortas.findMany({ take: 3 });
    console.log(`🎂 Tortas encontradas: ${tortas.length}`);
    
    const lugares = await prisma.lugares.findMany({ take: 3 });
    console.log(`📍 Lugares encontrados: ${lugares.length}`);
    
    const deportes = await prisma.deportes_equipamiento.findMany({ take: 3 });
    console.log(`⚽ Deportes encontrados: ${deportes.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCelularesData();

