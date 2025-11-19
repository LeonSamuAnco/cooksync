const axios = require('axios');

async function testUserEndpoint() {
  try {
    console.log('🧪 Probando endpoint de usuario...');
    
    // Primero hacer login para obtener token
    const loginResponse = await axios.post('http://localhost:3002/auth/login', {
      email: 'samuel@test.com', // Cambiar por un email válido
      password: 'password123'   // Cambiar por una contraseña válida
    });
    
    console.log('✅ Login exitoso');
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    
    console.log('👤 Usuario del login:', {
      id: user.id,
      nombres: user.nombres,
      email: user.email,
      rol: user.rol?.codigo
    });
    
    // Ahora probar el endpoint de usuario
    const userResponse = await axios.get(`http://localhost:3002/auth/user/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Endpoint de usuario exitoso');
    console.log('👤 Usuario del endpoint:', {
      id: userResponse.data.id,
      nombres: userResponse.data.nombres,
      email: userResponse.data.email,
      rol: userResponse.data.rol?.codigo,
      tieneRol: !!userResponse.data.rol,
      tieneCliente: !!userResponse.data.cliente
    });
    
    console.log('📊 Estructura completa:', JSON.stringify(userResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUserEndpoint();