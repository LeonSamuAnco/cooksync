const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testAuthEndpoint() {
  try {
    console.log('🧪 Probando endpoint de autenticación...\n');

    // Probar endpoint de roles primero
    console.log('🔍 Probando GET /auth/roles...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/auth/roles`);
      console.log('✅ Roles endpoint funciona!');
      console.log('📋 Respuesta:', JSON.stringify(rolesResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Error en roles endpoint:');
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Mensaje:', error.response?.data?.message || error.message);
    }

    console.log('\n🔐 Probando POST /auth/login...');
    
    // Probar login con diferentes credenciales
    const testCredentials = [
      { email: 'anco@gmail.com', password: '123456' },
      { email: 'admin@cooksync.com', password: 'admin123' },
    ];

    for (const cred of testCredentials) {
      try {
        console.log(`\n🔑 Probando: ${cred.email}`);
        
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, cred, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });

        console.log('✅ Login exitoso!');
        console.log('📋 Status:', loginResponse.status);
        console.log('📋 Token:', loginResponse.data.token ? 'Presente' : 'Ausente');
        console.log('📋 Usuario:', loginResponse.data.user ? 'Presente' : 'Ausente');
        
        if (loginResponse.data.token) {
          console.log('🎉 ¡Token obtenido! Probando favoritos...');
          
          // Probar endpoint de favoritos
          try {
            const favoritesResponse = await axios.post(`${BASE_URL}/favorites`, {
              tipo: 'celular',
              referenciaId: 39
            }, {
              headers: {
                'Authorization': `Bearer ${loginResponse.data.token}`,
                'Content-Type': 'application/json',
              },
            });

            console.log('✅ ¡Favorito agregado exitosamente!');
            console.log('📋 Respuesta:', JSON.stringify(favoritesResponse.data, null, 2));
            
          } catch (favoriteError) {
            console.log('❌ Error al agregar favorito:');
            console.log('📋 Status:', favoriteError.response?.status);
            console.log('📋 Mensaje:', favoriteError.response?.data?.message || favoriteError.message);
          }
        }
        
        return; // Si llegamos aquí, el login funcionó
        
      } catch (error) {
        console.log('❌ Error en login:');
        console.log('📋 Status:', error.response?.status);
        console.log('📋 Mensaje:', error.response?.data?.message || error.message);
        console.log('📋 Datos:', JSON.stringify(error.response?.data, null, 2));
      }
    }

  } catch (error) {
    console.log('❌ Error general:');
    console.log('📋 Mensaje:', error.message);
  }
}

testAuthEndpoint();

