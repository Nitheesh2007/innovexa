const axios = require('axios');

async function testFinanceAndSecurity() {
  console.log('🔒 Testing Security & Finance Modules with Staff/User Role...');
  const baseUrl = 'http://localhost:5000/api';

  // 1. Authenticate as staff/user
  console.log('\n1. Logging in as staff user (user@stockflow.com)...');
  const loginRes = await axios.post(`${baseUrl}/auth/login`, {
    email: 'user@stockflow.com',
    password: 'User@12345'
  });

  const token = loginRes.data.data.token;
  const userPayload = loginRes.data.data;
  console.log('✅ Staff logged in successfully! Role:', userPayload.role);
  if (userPayload.password) {
    throw new Error('❌ SECURITY VIOLATION: Password returned in login response!');
  } else {
    console.log('✅ Security Check Passed: No password in login response');
  }

  const client = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` }
  });

  // 2. Test Base Finance Data endpoints (exact ones used in Finance.jsx)
  console.log('\n2. Testing Finance Base Data endpoints...');
  const [statsRes, custRes, suppRes, payRes] = await Promise.all([
    client.get('/finance/profit-loss'),
    client.get('/customers'),
    client.get('/suppliers'),
    client.get('/finance/payment-history')
  ]);

  console.log('✅ /finance/profit-loss status:', statsRes.status, 'Data:', statsRes.data.data);
  console.log('✅ /customers status:', custRes.status, 'Count:', custRes.data.data.length);
  console.log('✅ /suppliers status:', suppRes.status, 'Count:', suppRes.data.data.length);
  console.log('✅ /finance/payment-history status:', payRes.status, 'Count:', payRes.data.data.length);

  // 3. Test Timeseries & Ledgers
  console.log('\n3. Testing Finance Timeseries & Ledgers...');
  const timeseriesRes = await client.get('/finance/timeseries?timeframe=monthly');
  console.log('✅ /finance/timeseries status:', timeseriesRes.status, 'Count:', timeseriesRes.data.data.length);

  if (custRes.data.data.length > 0) {
    const custId = custRes.data.data[0]._id;
    const custLedgerRes = await client.get(`/finance/customer-ledger/${custId}`);
    console.log('✅ /finance/customer-ledger status:', custLedgerRes.status, 'Current balance:', custLedgerRes.data.currentBalance);
  }

  if (suppRes.data.data.length > 0) {
    const suppId = suppRes.data.data[0]._id;
    const suppLedgerRes = await client.get(`/finance/supplier-ledger/${suppId}`);
    console.log('✅ /finance/supplier-ledger status:', suppLedgerRes.status, 'Current balance:', suppLedgerRes.data.currentBalance);
  }

  // 4. Test User list and assert NO passwords leaked
  console.log('\n4. Testing /api/users endpoint for password exposure...');
  const usersRes = await client.get('/users');
  console.log('✅ /users status:', usersRes.status, 'Users count:', usersRes.data.data.length);
  const leakedPasswords = usersRes.data.data.filter(u => u.password !== undefined);
  if (leakedPasswords.length > 0) {
    throw new Error(`❌ SECURITY VIOLATION: ${leakedPasswords.length} user record(s) exposed password field!`);
  }
  console.log('✅ Security Check Passed: 0/0 users leak password field in /api/users');

  // 5. Test Suggestions & Intelligence
  console.log('\n5. Testing /api/suggestions & /api/intelligence/stock-health...');
  const intelRes = await client.get('/intelligence/stock-health');
  console.log('✅ /intelligence/stock-health status:', intelRes.status, 'Data points:', intelRes.data.data?.length);

  const suggRes = await client.get('/suggestions');
  console.log('✅ /suggestions status:', suggRes.status, 'Count:', suggRes.data.data?.length);

  console.log('\n🎉 ALL FINANCE ENDPOINTS AND SECURITY CHECKS PASSED WITH 100% SUCCESS!');
}

testFinanceAndSecurity().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
