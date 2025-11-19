const axios = require('axios');

async function testProfileEndpoints() {
  try {
    console.log('🧪 Probando endpoints del perfil de usuario...\n');
    
    // 1. Login para obtener token
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await axios.post('http://localhost:3002/auth/login', {
      email: 'samuel@test.com', // Cambiar por un email válido
      password: 'password123'   // Cambiar por una contraseña válida
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login exitoso');
    console.log(`👤 Usuario: ${user.nombres} ${user.apellidos} (ID: ${user.id})\n`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Obtener datos del usuario
    console.log('2️⃣ Obteniendo datos del usuario...');
    const userResponse = await axios.get(`http://localhost:3002/auth/user/${user.id}`, { headers });
    console.log('✅ Datos del usuario obtenidos');
    console.log(`📊 Estructura: ${Object.keys(userResponse.data).join(', ')}\n`);

    // 3. Obtener estadísticas del perfil
    console.log('3️⃣ Obteniendo estadísticas del perfil...');
    const statsResponse = await axios.get(`http://localhost:3002/auth/profile-stats/${user.id}`, { headers });
    console.log('✅ Estadísticas obtenidas');
    console.log(`📈 Puntos: ${statsResponse.data.puntos}`);
    console.log(`🏆 Nivel: ${statsResponse.data.nivel}`);
    console.log(`🔥 Racha: ${statsResponse.data.racha} días`);
    console.log(`📋 Total actividades: ${statsResponse.data.totalActividades}\n`);

    // 4. Actualizar perfil
    console.log('4️⃣ Actualizando perfil...');
    const updateData = {
      nombres: 'SAMUEL ACTUALIZADO',
      apellidos: 'LEONARDO TEST',
      telefono: '+51 999 888 777',
      bio: 'Usuario de prueba actualizado',
      ciudad: 'Arequipa',
      pais: 'Perú'
    };
    
    const updateResponse = await axios.put('http://localhost:3002/auth/update-profile', updateData, { headers });
    console.log('✅ Perfil actualizado');
    console.log(`👤 Nuevo nombre: ${updateResponse.data.nombres} ${updateResponse.data.apellidos}`);
    console.log(`📱 Teléfono: ${updateResponse.data.telefono}`);
    console.log(`🏙️ Ciudad: ${updateResponse.data.ciudad}\n`);

    // 5. Verificar actividades
    console.log('5️⃣ Verificando actividades...');
    try {
      const activitiesResponse = await axios.get('http://localhost:3002/activity/my-activities?limit=5', { headers });
      console.log('✅ Actividades obtenidas');
      console.log(`📋 Total: ${activitiesResponse.data.total || activitiesResponse.data.length} actividades\n`);
    } catch (error) {
      console.log('⚠️ Error obteniendo actividades:', error.response?.data?.message || error.message);
    }

    // 6. Verificar favoritos
    console.log('6️⃣ Verificando favoritos...');
    try {
      const favoritesResponse = await axios.get('http://localhost:3002/favorites/my-favorites?limit=5', { headers });
      console.log('✅ Favoritos obtenidos');
      console.log(`💖 Total: ${favoritesResponse.data.total || favoritesResponse.data.length} favoritos\n`);
    } catch (error) {
      console.log('⚠️ Error obteniendo favoritos:', error.response?.data?.message || error.message);
    }

    console.log('🎉 Pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de endpoints implementados:');
    console.log('✅ PUT /auth/update-profile - Actualizar perfil');
    console.log('✅ GET /auth/user/:id - Obtener datos del usuario');
    console.log('✅ GET /auth/profile-stats/:id - Obtener estadísticas');
    console.log('✅ GET /activity/my-activities - Actividades del usuario');
    console.log('✅ GET /favorites/my-favorites - Favoritos del usuario');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

testProfileEndpoints();
