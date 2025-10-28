const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Prisma...');
    
    console.log('✓ prisma.recipes:', typeof prisma.recipes);
    console.log('✓ prisma.celulares:', typeof prisma.celulares);
    console.log('✓ prisma.tortas:', typeof prisma.tortas);
    console.log('✓ prisma.torta_sabores:', typeof prisma.torta_sabores);
    
    // Probar conexión básica
    const roles = await prisma.role.findMany();
    console.log('✅ Roles encontrados:', roles.length);
    
    const documentTypes = await prisma.documentType.findMany();
    console.log('✅ Tipos de documento encontrados:', documentTypes.length);
    
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        rol: true,
        tipoDocumento: true,
      }
    });
    console.log('✅ Usuarios encontrados:', users.length);
    
    if (users.length > 0) {
      console.log('👤 Primer usuario:', {
        id: users[0].id,
        email: users[0].email,
        nombres: users[0].nombres,
        rol: users[0].rol.nombre
      });
    }
    
    console.log('🎉 ¡Prisma funciona correctamente!');
    
  } catch (error) {
    console.error('❌ Error en Prisma:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
