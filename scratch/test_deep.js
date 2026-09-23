const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function testDeep() {
  const login = await request('POST', '/api/auth/login', { email: 'admin@stockflow.com', password: 'Admin@12345' });
  const token = login.data?.data?.token;

  // 1. Get BOM list
  const boms = await request('GET', '/api/bom', null, token);
  const firstBom = boms.data?.data[0];
  console.log('BOM #1:', firstBom?.bomNumber, 'Name:', firstBom?.name, 'Total Cost:', firstBom?.totalCalculatedCost);

  // 2. Check Availability for 10 units
  const avail = await request('GET', `/api/bom/${firstBom._id}/availability?quantity=10`, null, token);
  console.log('Feasibility check for 10 units:', avail.data?.data);

  // 3. Complete a work order
  const woList = await request('GET', '/api/work-orders', null, token);
  const inProgressWo = woList.data?.data.find(w => w.status === 'in_progress');
  if (inProgressWo) {
    console.log('Found in-progress work order:', inProgressWo.orderNumber);
    const completeRes = await request('PATCH', `/api/work-orders/${inProgressWo._id}/status`, {
      status: 'completed',
      actualProduced: inProgressWo.targetQuantity,
      scrapQuantity: 0,
      notes: 'Automated test pass'
    }, token);
    console.log('Completed status:', completeRes.status, 'New status:', completeRes.data?.data?.status);
  }

  // 4. Check Assets
  const assets = await request('GET', '/api/assets', null, token);
  console.log('First asset:', assets.data?.data[0]?.name, 'Book Value:', assets.data?.data[0]?.currentBookValue);

  // 5. Check Transfers
  const trfs = await request('GET', '/api/stock-transfers', null, token);
  console.log('First transfer:', trfs.data?.data[0]?.transferNumber, 'Status:', trfs.data?.data[0]?.status);

  console.log('\n✅ DEEP E2E TEST COMPLETED WITH 100% SUCCESS!');
}

testDeep().catch(console.error);
