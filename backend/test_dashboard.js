const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'admin@stockflow.com',
      password: 'Admin@12345'
    });
    
    const token = loginRes.data.data.token;
    console.log('Login successful, token length:', token.length);
    
    const statsRes = await axios.get('http://localhost:5000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Stats successful:', Object.keys(statsRes.data.data));
  } catch (e) {
    console.error('FAIL', e.response?.data || e.message);
  }
}
test();
