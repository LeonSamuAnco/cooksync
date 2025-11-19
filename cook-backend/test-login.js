const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testLogin() {
  const credentials = [
    { email: 'anco@gmail.com', password: '123456' },
    { email: 'anco@gmail.com', password: 'password' },
    { email: 'anco@gmail.com', password: 'admin123' },
    { email: 'anco@gmail.com', password: 'anco123' },
    { email: 'admin@cooksync.com', password: 'admin123' },
    { email: 'admin@cooksync.com', password: '123456' },
    { email: 'samueleonardo159@gmail.com', password: '123456' },
    { email: 'vero@gmail.com', password: '123456' },
  ];

  for (const cred of credentials) {
    try {
      console.log(`🔐 Probando: ${cred.email} / ${cred.password}`);
      
      const response = await axios.post(`${BASE_URL}/auth/login`, cred);
      
      if (response.data.token) {
        console.log('✅ Login exitoso!');
        console.log('📋 Token:', response.data.token.substring(0, 50) + '...');
        console.log('📋 Usuario:', JSON.stringify(response.data.user, null, 2));
        return response.data.token;
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }
    console.log('---');
  }
  
  console.log('❌ No se pudo hacer login con ninguna credencial');
  return null;
}

testLogin();
