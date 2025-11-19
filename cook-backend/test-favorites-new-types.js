const axios = require('axios');

async function testFavoritesWithNewTypes() {
  try {
    console.log('🧪 Probando favoritos con nuevos tipos...\n');
    
    // 1. Login para obtener token
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await axios.post('http://localhost:3002/auth/login', {
      email: 'samuel@test.com', // Cambiar por un email válido
      password: 'password123'   // Cambiar por una contraseña válida
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login exitoso');
    console.log(`👤 Usuario: ${user.nombres} (ID: ${user.id})\n`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Probar agregar celular a favoritos
    console.log('2️⃣ Probando agregar celular a favoritos...');
    try {
      const celularResponse = await axios.post('http://localhost:3002/favorites', {
        tipo: 'celular',
        referenciaId: 1
      }, { headers });
      console.log('✅ Celular agregado a favoritos:', celularResponse.data);
    } catch (error) {
      console.log('❌ Error con celular:', error.response?.data?.message || error.message);
    }

    // 3. Probar agregar torta a favoritos
    console.log('\n3️⃣ Probando agregar torta a favoritos...');
    try {
      const tortaResponse = await axios.post('http://localhost:3002/favorites', {
        tipo: 'torta',
        referenciaId: 1
      }, { headers });
      console.log('✅ Torta agregada a favoritos:', tortaResponse.data);
    } catch (error) {
      console.log('❌ Error con torta:', error.response?.data?.message || error.message);
    }

    // 4. Probar agregar lugar a favoritos
    console.log('\n4️⃣ Probando agregar lugar a favoritos...');
    try {
      const lugarResponse = await axios.post('http://localhost:3002/favorites', {
        tipo: 'lugar',
        referenciaId: 1
      }, { headers });
      console.log('✅ Lugar agregado a favoritos:', lugarResponse.data);
    } catch (error) {
      console.log('❌ Error con lugar:', error.response?.data?.message || error.message);
    }

    // 5. Probar agregar deporte a favoritos
    console.log('\n5️⃣ Probando agregar deporte a favoritos...');
    try {
      const deporteResponse = await axios.post('http://localhost:3002/favorites', {
        tipo: 'deporte',
        referenciaId: 1
      }, { headers });
      console.log('✅ Deporte agregado a favoritos:', deporteResponse.data);
    } catch (error) {
      console.log('❌ Error con deporte:', error.response?.data?.message || error.message);
    }

    // 6. Verificar favoritos del usuario
    console.log('\n6️⃣ Verificando favoritos del usuario...');
    try {
      const favoritesResponse = await axios.get('http://localhost:3002/favorites/my-favorites', { headers });
      console.log('✅ Favoritos obtenidos:', favoritesResponse.data);
    } catch (error) {
      console.log('❌ Error obteniendo favoritos:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

testFavoritesWithNewTypes();

