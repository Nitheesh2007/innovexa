const axios = require('axios');

const API = 'http://localhost:5000/api';

async function runQA() {
  console.log('--- STARTING STOCKFLOW E2E QA ---');
  let token = '';
  
  try {
    console.log('1. Testing Auth (Register/Login)');
    // Register
    try {
      await axios.post(`${API}/auth/register`, { name: 'QA User', email: 'qa@stockflow.com', password: 'password123' });
    } catch(e) {} // Might exist
    
    // Login
    const loginRes = await axios.post(`${API}/auth/login`, { email: 'qa@stockflow.com', password: 'password123' });
    token = loginRes.data.data.token;
    console.log('✅ Auth successful. Token received.');
  } catch (e) {
    console.error('❌ Auth Failed', e.response?.data || e.message);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    console.log('2. Testing Product CRUD');
    // We need a category, supplier, warehouse to create a product.
    // Let's just hit the get endpoints first
    const prods = await axios.get(`${API}/products`, { headers });
    console.log(`✅ Fetched ${prods.data.data.length} products`);
  } catch(e) {
    console.error('❌ Product CRUD Failed', e.response?.data || e.message);
  }

  try {
    console.log('3. Testing Dashboard Stats');
    const stats = await axios.get(`${API}/dashboard`, { headers });
    console.log('✅ Dashboard Data:', Object.keys(stats.data.data));
  } catch (e) {
    console.error('❌ Dashboard Failed', e.response?.data || e.message);
  }

  try {
    console.log('4. Testing Intelligence (Fallback mode)');
    const intel = await axios.get(`${API}/intelligence`, { headers });
    console.log('✅ Intelligence Data length:', intel.data.data.length);
  } catch (e) {
    console.error('❌ Intelligence Failed', e.response?.data || e.message);
  }

  console.log('--- QA COMPLETE ---');
}

runQA();
