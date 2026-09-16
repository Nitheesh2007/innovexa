const axios = require('axios');

async function runTests() {
  console.log('--- RUNNING API TESTS ---');
  
  try {
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health Check: ', health.data);
  } catch(e) { console.error('❌ Health Check Failed', e.message); }

  try {
    const status = await axios.get('http://localhost:5000/api/system/status');
    console.log('✅ System Status: ', status.data);
  } catch(e) { console.error('❌ System Status Failed', e.message); }

  // We need a token for protected routes, but let's see if it rejects properly.
  try {
    await axios.get('http://localhost:5000/api/intelligence');
    console.log('❌ Intelligence should have failed without token');
  } catch(e) { 
    if (e.response && e.response.status === 401) {
      console.log('✅ Intelligence Auth properly protected (401)');
    } else {
      console.error('❌ Intelligence Auth failed in an unexpected way', e.message);
    }
  }

  console.log('--- TESTS COMPLETE ---');
}

runTests();
