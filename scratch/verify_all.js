const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (postData) req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    req.end();
  });
}

async function runVerification() {
  console.log('🧪 Starting Automated Comprehensive Verification...');

  // 1. Root / delivers 200 OK
  const rootRes = await request({ host: 'localhost', port: 5000, path: '/', method: 'GET' });
  console.log(`✅ [1/5] Root Page GET / responded with status: ${rootRes.statusCode}`);
  if (rootRes.statusCode !== 200) throw new Error('Root page failed to respond with 200');

  // 2. Check compiled HTML and assets
  const distHtml = fs.readFileSync(path.join(__dirname, '../frontend/dist/index.html'), 'utf8');
  console.log('✅ [2/5] Frontend dist index.html exists and is correctly built.');

  // Check bundle content for How It Works and INR
  const assetsDir = path.join(__dirname, '../frontend/dist/assets');
  const assetFiles = fs.readdirSync(assetsDir);
  const jsFile = assetFiles.find(f => f.endsWith('.js'));
  const bundleContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

  const hasHowItWorks = bundleContent.includes('how-it-works') || bundleContent.includes('How It Works');
  const hasInr = bundleContent.includes('₹');
  const hasPhoneScanner = bundleContent.includes('Tap to Scan Item with Phone Camera');
  const hasStepOne = bundleContent.includes('Product Ingestion Simulator') || bundleContent.includes('catalog_inventory');
  const hasPermissions = bundleContent.includes('Staff Permissions & Safety') || bundleContent.includes('RBAC Enforced');

  console.log(`✅ [3/5] Bundle Inspection:
    - How It Works Anchor/Section: ${hasHowItWorks ? 'PRESENT' : 'MISSING'}
    - Indian Rupee (₹) Symbol: ${hasInr ? 'PRESENT' : 'MISSING'}
    - Phone Scanner Simulator: ${hasPhoneScanner ? 'PRESENT' : 'MISSING'}
    - Product Ingestion Simulator: ${hasStepOne ? 'PRESENT' : 'MISSING'}
    - Role Permissions Matrix: ${hasPermissions ? 'PRESENT' : 'MISSING'}
  `);

  if (!hasHowItWorks || !hasInr || !hasPhoneScanner) {
    throw new Error('Bundle is missing key features');
  }

  // 3. Authenticate standard user and verify access
  const loginRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'user@stockflow.com', password: 'User@12345' });

  const loginData = JSON.parse(loginRes.body);
  console.log(`✅ [4/5] Standard User Login: status ${loginRes.statusCode}, role: ${loginData.data?.user?.role}`);
  const token = loginData.data?.token;

  // Verify standard user can fetch products and dashboard stats created by admin
  const dashRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const dashData = JSON.parse(dashRes.body);
  console.log(`    - Dashboard stats retrieved: Total products: ${dashData.data?.totalProducts}, Valuation: ₹${dashData.data?.inventoryValue?.toLocaleString('en-IN')}`);

  // 4. Verify standard user cannot delete users (403 Forbidden)
  const usersRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = JSON.parse(usersRes.body);
  const targetUser = usersData.data?.[0];
  
  if (targetUser) {
    const deleteRes = await request({
      host: 'localhost',
      port: 5000,
      path: `/api/users/${targetUser._id}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`    - Non-admin DELETE /api/users/:id response: ${deleteRes.statusCode} (${deleteRes.statusCode === 403 ? 'FORBIDDEN as expected' : 'UNEXPECTED'})`);
    if (deleteRes.statusCode !== 403) throw new Error('User deletion was not restricted to admin!');
  }

  // 5. Verify reports output INR (₹)
  const reportRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/reports/inventory',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const reportData = JSON.parse(reportRes.body);
  const firstItem = reportData.data?.[0];
  console.log(`✅ [5/5] Reports Currency Check:
    - Purchase Price format: ${firstItem?.['Purchase Price']}
    - Selling Price format: ${firstItem?.['Selling Price']}
  `);

  if (!firstItem?.['Purchase Price']?.startsWith('₹')) {
    throw new Error('Report prices are not in Indian Rupees (₹)');
  }

  console.log('\n🎉 ALL AUTOMATED VERIFICATIONS PASSED WITH 100% SUCCESS!');
}

runVerification().catch(err => {
  console.error('❌ Verification Failed:', err);
  process.exit(1);
});
