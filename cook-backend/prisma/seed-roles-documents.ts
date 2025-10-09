import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRolesAndDocuments() {
  console.log('🌱 Insertando roles y tipos de documento...');

  // Insertar Roles
  const roles = [
    { codigo: 'CLI', nombre: 'CLIENTE', descripcion: 'Usuario cliente del sistema', esActivo: true },
    { codigo: 'VEN', nombre: 'VENDEDOR', descripcion: 'Usuario vendedor de productos', esActivo: true },
    { codigo: 'ADM', nombre: 'ADMIN', descripcion: 'Administrador del sistema', esActivo: true },
    { codigo: 'MOD', nombre: 'MODERADOR', descripcion: 'Moderador de contenido', esActivo: true },
  ];

  console.log('\n📋 Insertando roles...');
  for (const role of roles) {
    const existing = await prisma.role.findFirst({
      where: { nombre: role.nombre },
    });

    if (!existing) {
      await prisma.role.create({ data: role });
      console.log(`✅ Rol creado: ${role.nombre}`);
    } else {
      console.log(`⏭️  Rol ya existe: ${role.nombre}`);
    }
  }

  // Insertar Tipos de Documento
  const documentTypes = [
    { codigo: 'DNI', nombre: 'DNI', descripcion: 'Documento Nacional de Identidad', longitudMinima: 8, longitudMaxima: 8, esActivo: true },
    { codigo: 'PASS', nombre: 'Pasaporte', descripcion: 'Pasaporte', longitudMinima: 8, longitudMaxima: 12, esActivo: true },
    { codigo: 'CE', nombre: 'Carnet de Extranjería', descripcion: 'Carnet de Extranjería', longitudMinima: 9, longitudMaxima: 12, esActivo: true },
    { codigo: 'RUC', nombre: 'RUC', descripcion: 'Registro Único de Contribuyentes', longitudMinima: 11, longitudMaxima: 11, esActivo: true },
  ];

  console.log('\n📄 Insertando tipos de documento...');
  for (const docType of documentTypes) {
    const existing = await prisma.documentType.findFirst({
      where: { nombre: docType.nombre },
    });

    if (!existing) {
      await prisma.documentType.create({ data: docType });
      console.log(`✅ Tipo de documento creado: ${docType.nombre}`);
    } else {
      console.log(`⏭️  Tipo de documento ya existe: ${docType.nombre}`);
    }
  }

  console.log('\n🎉 Roles y tipos de documento insertados correctamente!');
}

seedRolesAndDocuments()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
