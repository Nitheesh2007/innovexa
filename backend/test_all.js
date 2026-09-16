const axios = require('axios');

async function test() {
  console.log('Testing User Login...');
  try {
    const res = await axios.post('http://localhost:8072/api/auth/login', {
      email: 'user@stockflow.com',
      password: 'User@12345'
    });
    console.log('PASS', res.data.message);
  } catch (e) {
    console.error('FAIL', e.response?.data);
  }

  console.log('\nTesting Admin Login...');
  try {
    const res = await axios.post('http://localhost:8072/api/auth/admin-login', {
      email: 'admin@stockflow.com',
      password: 'Admin@12345'
    });
    console.log('PASS', res.data.message);
  } catch (e) {
    console.log('FAIL', e.response?.data);
  }
}
test();
