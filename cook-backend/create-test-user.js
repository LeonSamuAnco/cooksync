const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Creando usuario de prueba...\n');

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@cooksync.com' }
    });

    if (existingUser) {
      console.log('✅ Usuario de prueba ya existe');
      console.log('📋 ID:', existingUser.id);
      console.log('📋 Email:', existingUser.email);
      return existingUser;
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const newUser = await prisma.user.create({
      data: {
        email: 'test@cooksync.com',
        passwordHash: hashedPassword,
        nombres: 'Usuario',
        apellidos: 'Prueba',
        rol: 'CLIENTE',
        tipoDocumento: 'CEDULA',
        numeroDocumento: '12345678',
        telefono: '1234567890',
        fechaNacimiento: new Date('1990-01-01'),
        esActivo: true,
      },
    });

    console.log('✅ Usuario de prueba creado exitosamente!');
    console.log('📋 ID:', newUser.id);
    console.log('📋 Email:', newUser.email);
    console.log('📋 Password: 123456');

    return newUser;

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
