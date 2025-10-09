import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedClientPlans() {
  console.log('🌱 Insertando planes de cliente...');

  const plans = [
    {
      codigo: 'BASICO',
      nombre: 'Plan Básico',
      descripcion: 'Plan básico gratuito para todos los usuarios',
      precio: 0,
      duracionDias: 365,
      limiteRecetas: 100,
      limiteIngredientes: 50,
      accesoRecetasPremium: false,
      descuentoCompras: 0,
      esActivo: true,
    },
    {
      codigo: 'PREMIUM',
      nombre: 'Plan Premium',
      descripcion: 'Plan premium con acceso a recetas exclusivas',
      precio: 9.99,
      duracionDias: 30,
      limiteRecetas: null, // Sin límite
      limiteIngredientes: null, // Sin límite
      accesoRecetasPremium: true,
      descuentoCompras: 10,
      esActivo: true,
    },
    {
      codigo: 'PRO',
      nombre: 'Plan Pro',
      descripcion: 'Plan profesional para chefs y cocineros',
      precio: 19.99,
      duracionDias: 30,
      limiteRecetas: null,
      limiteIngredientes: null,
      accesoRecetasPremium: true,
      descuentoCompras: 20,
      esActivo: true,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.clientPlan.findFirst({
      where: { nombre: plan.nombre },
    });

    if (!existing) {
      await prisma.clientPlan.create({
        data: plan,
      });
      console.log(`✅ Plan creado: ${plan.nombre}`);
    } else {
      console.log(`⏭️  Plan ya existe: ${plan.nombre}`);
    }
  }

  console.log('🎉 Planes de cliente insertados correctamente!');
}

seedClientPlans()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
