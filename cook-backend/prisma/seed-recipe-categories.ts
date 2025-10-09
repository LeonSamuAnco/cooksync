import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRecipeCategories() {
  console.log('🌱 Insertando categorías de recetas...');

  const recipeCategories = [
    {
      nombre: 'Platos Principales',
      descripcion: 'Platos principales y comidas completas',
      esActivo: true,
    },
    {
      nombre: 'Entradas',
      descripcion: 'Aperitivos y entradas para comenzar la comida',
      esActivo: true,
    },
    {
      nombre: 'Postres',
      descripcion: 'Dulces y postres deliciosos',
      esActivo: true,
    },
    {
      nombre: 'Sopas y Caldos',
      descripcion: 'Sopas, caldos y cremas nutritivas',
      esActivo: true,
    },
    {
      nombre: 'Ensaladas',
      descripcion: 'Ensaladas frescas y saludables',
      esActivo: true,
    },
    {
      nombre: 'Bebidas',
      descripcion: 'Bebidas refrescantes y nutritivas',
      esActivo: true,
    },
    {
      nombre: 'Desayunos',
      descripcion: 'Opciones deliciosas para comenzar el día',
      esActivo: true,
    },
    {
      nombre: 'Snacks',
      descripcion: 'Bocadillos y snacks para cualquier momento',
      esActivo: true,
    },
    {
      nombre: 'Comida Peruana',
      descripcion: 'Platos tradicionales de la gastronomía peruana',
      esActivo: true,
    },
    {
      nombre: 'Comida Internacional',
      descripcion: 'Recetas de cocinas del mundo',
      esActivo: true,
    },
  ];

  for (const category of recipeCategories) {
    const existing = await prisma.recipeCategory.findFirst({
      where: { nombre: category.nombre },
    });

    if (!existing) {
      await prisma.recipeCategory.create({
        data: category,
      });
      console.log(`✅ Categoría creada: ${category.nombre}`);
    } else {
      console.log(`⏭️  Categoría ya existe: ${category.nombre}`);
    }
  }

  console.log('🎉 Categorías de recetas insertadas correctamente!');
}

seedRecipeCategories()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
