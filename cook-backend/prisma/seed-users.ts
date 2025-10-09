import { PrismaClient, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Insertando usuarios de prueba...');

  // Obtener roles existentes
  const clientRole = await prisma.role.findFirst({
    where: { codigo: 'CLIENTE' },
  });
  const vendorRole = await prisma.role.findFirst({
    where: { codigo: 'VEN' },
  });
  const adminRole = await prisma.role.findFirst({
    where: { codigo: 'ADMIN' },
  });
  const moderatorRole = await prisma.role.findFirst({
    where: { codigo: 'MODERADOR' },
  });

  if (!clientRole || !vendorRole || !adminRole || !moderatorRole) {
    console.error(
      '❌ Error: Los roles no existen. Ejecuta primero seed-roles-documents.ts',
    );
    return;
  }

  // Obtener tipo de documento DNI
  const dniType = await prisma.documentType.findFirst({
    where: { codigo: 'DNI' },
  });
  if (!dniType) {
    console.error(
      '❌ Error: Tipo de documento DNI no existe. Ejecuta primero seed-roles-documents.ts',
    );
    return;
  }

  // Hash de contraseñas
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Usuarios de prueba (sin especificar ID - autoincrement)
  const users = [
    {
      nombres: 'Juan Carlos',
      apellidos: 'García López',
      email: 'admin@cooksync.com',
      passwordHash: hashedPassword,
      numeroDocumento: '12345678',
      telefono: '987654321',
      fechaNacimiento: new Date('1985-05-15'),
      genero: Gender.M,
      esActivo: true,
      rolId: adminRole.id,
      tipoDocumentoId: dniType.id,
    },
    {
      nombres: 'María Elena',
      apellidos: 'Rodríguez Silva',
      email: 'cliente@cooksync.com',
      passwordHash: hashedPassword,
      numeroDocumento: '87654321',
      telefono: '912345678',
      fechaNacimiento: new Date('1990-08-20'),
      genero: Gender.F,
      esActivo: true,
      rolId: clientRole.id,
      tipoDocumentoId: dniType.id,
    },
    {
      nombres: 'Carlos Alberto',
      apellidos: 'Mendoza Torres',
      email: 'vendedor@cooksync.com',
      passwordHash: hashedPassword,
      numeroDocumento: '11223344',
      telefono: '998877665',
      fechaNacimiento: new Date('1988-12-10'),
      genero: Gender.M,
      esActivo: true,
      rolId: vendorRole.id,
      tipoDocumentoId: dniType.id,
    },
    {
      nombres: 'Ana Sofía',
      apellidos: 'Vásquez Morales',
      email: 'moderador@cooksync.com',
      passwordHash: hashedPassword,
      numeroDocumento: '55667788',
      telefono: '955443322',
      fechaNacimiento: new Date('1992-03-25'),
      genero: Gender.F,
      esActivo: true,
      rolId: moderatorRole.id,
      tipoDocumentoId: dniType.id,
    },
  ];

  console.log('\n👥 Insertando usuarios...');
  for (const user of users) {
    const existing = await prisma.user.findFirst({
      where: { email: user.email },
    });

    if (!existing) {
      await prisma.user.create({ data: user });
      console.log(
        `✅ Usuario creado: ${user.email} (${user.nombres} ${user.apellidos})`,
      );
    } else {
      console.log(`⏭️  Usuario ya existe: ${user.email}`);
    }
  }

  console.log('\n🎉 Usuarios de prueba insertados correctamente!');
  console.log('\n📋 Credenciales de acceso:');
  console.log('Admin: admin@cooksync.com / 123456');
  console.log('Cliente: cliente@cooksync.com / 123456');
  console.log('Vendedor: vendedor@cooksync.com / 123456');
  console.log('Moderador: moderador@cooksync.com / 123456');
}

seedUsers()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
