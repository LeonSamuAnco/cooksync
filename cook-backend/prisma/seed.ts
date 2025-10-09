import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Limpieza de Tablas ---
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.recipeCategory.deleteMany({});
  await prisma.recipeDifficulty.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  console.log('Previous data cleaned.');

  // --- Creación de Categorías de Recetas ---
  const recipeCategories = await prisma.recipeCategory.createMany({
    data: [
      { id: 1, nombre: 'Desayunos', descripcion: 'Recetas para empezar el día' },
      { id: 2, nombre: 'Almuerzos', descripcion: 'Platos principales para el mediodía' },
      { id: 3, nombre: 'Cenas', descripcion: 'Comidas ligeras para la noche' },
      { id: 4, nombre: 'Sopas y Caldos', descripcion: 'Preparaciones líquidas reconfortantes' },
      { id: 5, nombre: 'Postres', descripcion: 'Dulces y postres deliciosos' },
      { id: 8, nombre: 'Comida Criolla', descripcion: 'Platos tradicionales peruanos' },
    ],
  });
  console.log('Recipe categories created.');

  // --- Creación de Dificultades de Recetas ---
  await prisma.recipeDifficulty.createMany({
    data: [
      { id: 1, nivel: 'FACIL', descripcion: 'Para principiantes', orden: 1 },
      { id: 2, nivel: 'INTERMEDIO', descripcion: 'Requiere algo de experiencia', orden: 2 },
      { id: 3, nivel: 'DIFICIL', descripcion: 'Para cocineros experimentados', orden: 3 },
    ],
  });
  console.log('Recipe difficulties created.');

  // --- Creación de Recetas ---
  await prisma.recipe.createMany({
    data: [
      {
        id: 1,
        nombre: 'Caldo de Pollo Casero',
        descripcion: 'Caldo reconfortante con pollo y verduras frescas, perfecto para días fríos.',
        categoriaRecetaId: 4,
        dificultadId: 1,
        tiempoPreparacion: 15,
        tiempoCoccion: 30,
        porciones: 4,
        instrucciones: '1. Lavar bien el pollo... 2. Hervir agua... 3. Agregar pollo...',
      },
      {
        id: 2,
        nombre: 'Tallarines Rojos Criollos',
        descripcion: 'Fideos en salsa roja con carne o pollo.',
        categoriaRecetaId: 2,
        dificultadId: 2,
        tiempoPreparacion: 20,
        tiempoCoccion: 15,
        porciones: 4,
        instrucciones: '1. Cocinar fideos... 2. Sofreír cebolla y ajo... 3. Agregar pasta de tomate...',
      },
      {
        id: 6,
        nombre: 'Lomo Saltado',
        descripcion: 'Trozos de lomo de res salteados con cebolla, tomate y ají.',
        categoriaRecetaId: 8,
        dificultadId: 2,
        tiempoPreparacion: 20,
        tiempoCoccion: 10,
        porciones: 4,
        instrucciones: '1. Cortar el lomo... 2. Freír las papas... 3. Saltear la carne...',
      },
    ],
  });
  console.log('Recipes created.');

  // --- Creación de Categorías de Productos ---
  const celulares = await prisma.productCategory.create({ data: { nombre: 'Celulares' } });
  const laptops = await prisma.productCategory.create({ data: { nombre: 'Laptops' } });
  console.log('Product categories created.');

  // --- Creación de Productos ---
  await prisma.product.createMany({
    data: [
      {
        nombre: 'Smartphone Galaxy S23',
        descripcion: 'El último smartphone de alta gama con cámara de 200MP.',
        precio: 999.99,
        categoriaId: celulares.id,
        atributos: { marca: 'Samsung', ram: '8GB', almacenamiento: '256GB' },
      },
      {
        nombre: 'iPhone 15 Pro',
        descripcion: 'El iPhone más potente con chip A17 Bionic.',
        precio: 1099.99,
        categoriaId: celulares.id,
        atributos: { marca: 'Apple', ram: '8GB', almacenamiento: '256GB' },
      },
      {
        nombre: 'MacBook Pro 14"',
        descripcion: 'Potente laptop con chip M2 Pro para profesionales.',
        precio: 1999.99,
        categoriaId: laptops.id,
        atributos: { marca: 'Apple', procesador: 'M2 Pro', ram: '16GB' },
      },
    ],
  });
  console.log('Products created.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
