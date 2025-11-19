const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRolesAndUsers() {
  try {
    console.log('🔍 Verificando roles y usuarios...\n');

    // Verificar roles
    const roles = await prisma.role.findMany();
    console.log('📋 Roles disponibles:');
    roles.forEach((role, index) => {
      console.log(`${index + 1}. ID: ${role.id} - ${role.codigo} (${role.nombre})`);
    });

    // Verificar usuarios con sus roles
    const users = await prisma.user.findMany({
      include: {
        rol: true,
        tipoDocumento: true,
      },
      take: 5,
    });

    console.log('\n👤 Usuarios disponibles:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombres} ${user.apellidos}`);
      console.log(`   Rol: ${user.rol?.codigo || 'N/A'} (${user.rol?.nombre || 'N/A'})`);
      console.log(`   Tipo Doc: ${user.tipoDocumento?.codigo || 'N/A'}`);
      console.log(`   Activo: ${user.esActivo ? 'Sí' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolesAndUsers();

