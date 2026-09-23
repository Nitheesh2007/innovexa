const axios = require('axios');

const testApi = async () => {
  const endpoints = [
    '/api/products',
    '/api/customers',
    '/api/suppliers',
    '/api/orders',
    '/api/invoices',
    '/api/finance/profit-loss',
    '/api/finance/expenses',
    '/api/dashboard',
    '/api/inventory'
  ];

  console.log('Testing endpoints...');
  
  // Since authentication is required for some routes, we might need a token.
  // Wait, the routes have `protect` middleware. We need to login first.
  let cookie = '';
  try {
    const authRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@stockflow.com',
      password: 'Admin@12345'
    });
    // Set-Cookie is an array in axios
    cookie = authRes.headers['set-cookie'] ? authRes.headers['set-cookie'].join('; ') : '';
    console.log('Login successful');
  } catch (e) {
    console.error('Login failed:', e.message);
    return;
  }

  for (const endpoint of endpoints) {
    try {
      await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { Cookie: cookie }
      });
      console.log(`✅ GET ${endpoint} - OK`);
    } catch (error) {
      console.error(`❌ GET ${endpoint} - FAILED:`, error.response?.status, error.response?.data?.message || error.message);
    }
  }
};

testApi();
