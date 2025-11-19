const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testTokenParsing() {
  try {
    console.log('🧪 Probando parsing del token...\n');

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
    
    // Parsear el token para ver su contenido
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    console.log('\n📋 Contenido del token:');
    console.log(JSON.stringify(payload, null, 2));

    // Probar endpoint protegido para ver qué recibe
    console.log('\n🔍 Probando endpoint protegido...');
    try {
      const response = await axios.get(`${BASE_URL}/favorites/my-favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('✅ Endpoint protegido funciona!');
      console.log('📋 Respuesta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error en endpoint protegido:');
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Mensaje:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Error general:');
    console.log('📋 Mensaje:', error.message);
    if (error.response) {
      console.log('📋 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testTokenParsing();

