const axios = require('axios');

async function test() {
  console.log('Testing Registration...');
  try {
    const res = await axios.post('http://localhost:8072/api/auth/register', {
      name: 'New Test',
      email: 'newtest@stockflow.com',
      password: 'Password123'
    });
    console.log('PASS Registration', res.data.message);
  } catch (e) {
    console.error('FAIL Registration', e.response?.data || e.message);
  }
}
test();
