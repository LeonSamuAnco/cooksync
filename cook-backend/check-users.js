const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Verificando usuarios en la base de datos...\n');

    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        rol: true,
        esActivo: true,
      },
    });

    console.log(`👤 Total de usuarios encontrados: ${users.length}\n`);
    
    if (users.length > 0) {
      console.log('📋 Usuarios disponibles:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.nombres} ${user.apellidos}`);
        console.log(`   Rol: ${user.rol}`);
        console.log(`   Activo: ${user.esActivo ? 'Sí' : 'No'}\n`);
      });
    } else {
      console.log('❌ No se encontraron usuarios en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

