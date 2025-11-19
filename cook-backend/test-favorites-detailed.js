const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testFavoritesDetailed() {
  try {
    console.log('🧪 Probando endpoint de favoritos con detalle...\n');

    // Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'anco@gmail.com',
      password: '123456'
    });

    if (!loginResponse.data.token) {
      console.log('❌ No se pudo obtener token');
      return;
    }

    console.log('✅ Login exitoso!');
    const token = loginResponse.data.token;
    console.log('📋 Token:', token.substring(0, 50) + '...\n');

    // Probar agregar favorito de deportes
    console.log('⚽ Probando agregar deporte ID 1 a favoritos...');
    
    try {
      const response = await axios.post(`${BASE_URL}/favorites`, {
        tipo: 'deporte',
        referenciaId: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ ¡Favorito agregado exitosamente!');
      console.log('📋 Respuesta completa:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.log('❌ Error al agregar favorito:');
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Status Text:', error.response?.statusText);
      console.log('📋 Headers:', error.response?.headers);
      console.log('📋 Datos:', JSON.stringify(error.response?.data, null, 2));
      console.log('📋 Mensaje:', error.message);
      
      // Si hay detalles del error, mostrarlos
      if (error.response?.data?.message) {
        console.log('\n💡 Mensaje de error detallado:', error.response.data.message);
      }
      if (error.response?.data?.error) {
        console.log('💡 Tipo de error:', error.response.data.error);
      }
      if (error.response?.data?.stack) {
        console.log('💡 Stack trace:', error.response.data.stack);
      }
    }

  } catch (error) {
    console.log('❌ Error general:');
    console.log('📋 Mensaje:', error.message);
    if (error.response) {
      console.log('📋 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFavoritesDetailed();

