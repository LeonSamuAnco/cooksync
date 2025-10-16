const fetch = require('node-fetch');

// Token de prueba - reemplaza con un token real del navegador
const TOKEN = 'TU_TOKEN_AQUI';

async function testFavoritesEndpoint() {
  console.log('🧪 Probando endpoint de favoritos...\n');

  try {
    const response = await fetch('http://localhost:3002/favorites/my-favorites?page=1&limit=20', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);

    const data = await response.json();
    console.log('📋 Respuesta:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Endpoint funcionando correctamente');
    } else {
      console.log('\n❌ Error en el endpoint');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Instrucciones
console.log('📝 INSTRUCCIONES:');
console.log('1. Abre el navegador y ve a la consola (F12)');
console.log('2. Ejecuta: localStorage.getItem("authToken")');
console.log('3. Copia el token');
console.log('4. Reemplaza TU_TOKEN_AQUI en este archivo');
console.log('5. Ejecuta: node scripts/test-favorites-endpoint.js\n');

if (TOKEN === 'TU_TOKEN_AQUI') {
  console.log('⚠️  Por favor, reemplaza TU_TOKEN_AQUI con tu token real\n');
} else {
  testFavoritesEndpoint();
}
