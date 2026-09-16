const axios = require('axios');

async function test() {
  console.log('Testing Admin Login with Admin User...');
  try {
    const res = await axios.post('http://localhost:8072/api/auth/admin-login', {
      email: 'admin@stockflow.com',
      password: 'Admin@123'
    });
    console.log('SUCCESS (Expected):', res.data.message);
  } catch (e) {
    console.error('FAIL (Unexpected):', e.response?.data);
  }

  console.log('\nTesting Admin Login with Staff User...');
  try {
    const res = await axios.post('http://localhost:8072/api/auth/admin-login', {
      email: 'staff@stockflow.com',
      password: 'Staff@123'
    });
    console.log('SUCCESS (Unexpected):', res.data);
  } catch (e) {
    console.log('FAIL (Expected):', e.response?.data?.message);
  }
}
test();
