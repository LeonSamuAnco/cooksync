const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTable() {
  console.log('🔍 Verificando tabla de favoritos...\n');

  try {
    // Intentar contar favoritos
    const count = await prisma.favorite.count();
    console.log('✅ Tabla "favoritos" existe y está accesible');
    console.log(`📊 Total de favoritos: ${count}\n`);

    // Verificar estructura con una consulta vacía
    const sample = await prisma.favorite.findMany({ take: 1 });
    console.log('✅ Estructura de la tabla verificada correctamente\n');

    console.log('🎉 ¡Todo está funcionando correctamente!');
    console.log('✅ La tabla favoritos está lista para usar\n');

  } catch (error) {
    console.error('❌ Error verificando tabla:', error.message);
    console.error('\n💡 Solución: Ejecuta "npx prisma db push" para sincronizar la base de datos\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTable();
