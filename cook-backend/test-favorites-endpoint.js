const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testFavoritesEndpoint() {
  try {
    console.log('🧪 Probando endpoint de favoritos...\n');

    // Primero necesitamos obtener un token de autenticación
    console.log('🔐 Intentando autenticación...');
    
    // Intentar login con credenciales de prueba
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'anco@gmail.com',
      password: '123456'
    });

    if (loginResponse.data.token) {
      console.log('✅ Login exitoso');
      const token = loginResponse.data.token;
      
      // Probar agregar celular a favoritos
      console.log('\n📱 Probando agregar celular ID 39 a favoritos...');
      
      try {
        const favoriteResponse = await axios.post(`${BASE_URL}/favorites`, {
          tipo: 'celular',
          referenciaId: 39
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Celular agregado a favoritos exitosamente!');
        console.log('📋 Respuesta:', JSON.stringify(favoriteResponse.data, null, 2));

        // Probar verificar si es favorito
        console.log('\n🔍 Verificando si es favorito...');
        const checkResponse = await axios.get(`${BASE_URL}/favorites/check/celular/39`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ Verificación exitosa!');
        console.log('📋 Respuesta:', JSON.stringify(checkResponse.data, null, 2));

      } catch (favoriteError) {
        console.log('❌ Error al agregar a favoritos:');
        console.log('📋 Status:', favoriteError.response?.status);
        console.log('📋 Mensaje:', favoriteError.response?.data?.message || favoriteError.message);
        console.log('📋 Datos:', JSON.stringify(favoriteError.response?.data, null, 2));
      }

    } else {
      console.log('❌ No se pudo obtener token de autenticación');
    }

  } catch (error) {
    console.log('❌ Error general:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensaje:', error.response?.data?.message || error.message);
    console.log('📋 Datos:', JSON.stringify(error.response?.data, null, 2));
  }
}

testFavoritesEndpoint();
