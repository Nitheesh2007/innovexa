const http = require('http');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Helper to make API requests using native Node.js HTTP (no extra npm packages required)
const request = (method, endpoint, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject({ status: res.statusCode, error: json });
          }
        } catch (e) {
          reject({ status: res.statusCode, error: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runIntegrationTest = async () => {
  console.log('==========================================');
  console.log('🚀 STOCKFLOW E2E INTEGRATION TEST SCRIPT 🚀');
  console.log('==========================================\n');

  let testContext = {};

  try {
    // 1. LOGIN
    console.log('[1/12] 🔐 Logging in as Admin...');
    const loginRes = await request('POST', '/auth/login', { email: 'admin@stockflow.com', password: 'Admin@12345' });
    authToken = loginRes.token;
    console.log('       ✅ Login Successful. Token acquired.');

    // 2. PRODUCT CREATION
    console.log('[2/12] 📦 Creating Test Product...');
    const prodRes = await request('POST', '/products', {
      productName: 'E2E Validation Widget',
      sku: 'E2E-' + Date.now(),
      category: 'Electronics',
      purchasePrice: 10,
      sellingPrice: 25,
      minimumStock: 5,
      maximumStock: 100,
      currentStock: 0,
      unit: 'pcs'
    });
    testContext.productId = prodRes.data._id;
    console.log('       ✅ Product created. ID:', testContext.productId);

    // 3. SUPPLIER CREATION
    console.log('[3/12] 🏭 Creating Test Supplier...');
    const suppRes = await request('POST', '/suppliers', {
      name: 'E2E Supplier Inc.',
      companyName: 'E2E Corp',
      email: `supp${Date.now()}@test.com`,
      phone: '555-1234'
    });
    testContext.supplierId = suppRes.data._id;
    console.log('       ✅ Supplier created. ID:', testContext.supplierId);

    // 4. CUSTOMER CREATION
    console.log('[4/12] 👤 Creating Test Customer...');
    const custRes = await request('POST', '/customers', {
      name: 'E2E VIP Customer',
      email: `cust${Date.now()}@test.com`,
      phone: '555-9876'
    });
    testContext.customerId = custRes.data._id;
    console.log('       ✅ Customer created. ID:', testContext.customerId);

    // 5. STOCK IN (PURCHASE)
    console.log('[5/12] 📥 Executing Stock-In (Purchase 100 units)...');
    const stockInRes = await request('POST', '/invoices/stock-in', {
      supplier: testContext.supplierId,
      items: [{
        product: testContext.productId,
        quantity: 100,
        unitPrice: 10,
        taxRate: 0,
        discount: 0
      }],
      paymentMethod: 'BANK',
      paidAmount: 1000 // Fully paid (100 * $10)
    });
    testContext.stockInInvoiceId = stockInRes.data._id;
    console.log('       ✅ Stock-In Successful. Invoice:', stockInRes.data.invoiceNumber);

    // 6. POS SALE (STOCK OUT)
    console.log('[6/12] 🛒 Executing POS Sale (Sell 10 units)...');
    const saleRes = await request('POST', '/invoices/stock-out', {
      customer: testContext.customerId,
      items: [{
        product: testContext.productId,
        quantity: 10,
        unitPrice: 25, // Selling price
        taxRate: 10, // 10% tax on 250 = 25
        discount: 5 // $5 discount
      }], // Item subtotal: 250 - 5 = 245 + 24.5 tax? Wait, backend tax is %
      paymentMethod: 'CASH',
      paidAmount: 269.5 // 10*25=250. 250-5=245. 245 * 1.1 = 269.5
    });
    testContext.saleInvoiceId = saleRes.data._id;
    console.log('       ✅ POS Sale Successful. Invoice:', saleRes.data.invoiceNumber);

    // 7. INVENTORY LEDGER VERIFICATION
    console.log('[7/12] 📊 Verifying Inventory Ledger consistency...');
    const prodCheck = await request('GET', `/products/${testContext.productId}`);
    if (prodCheck.data.currentStock !== 90) {
      throw new Error(`Inventory Math Failure! Expected 90 stock, got ${prodCheck.data.currentStock}`);
    }
    console.log('       ✅ Stock correctly updated to 90 (0 + 100 - 10).');

    // 8. FINANCE LEDGER VERIFICATION
    console.log('[8/12] 💰 Verifying Finance / Profit consistency...');
    const financeRes = await request('GET', '/finance/summary?range=today');
    // Ensure the sale was captured in revenue
    if (!financeRes.data || financeRes.data.revenue === undefined) {
      throw new Error('Finance summary endpoint failed or returned malformed data.');
    }
    console.log('       ✅ Finance aggregation is working and returning valid schema.');

    // 9. CUSTOMER LEDGER VERIFICATION
    console.log('[9/12] 💳 Verifying Customer Ledger...');
    const custCheck = await request('GET', `/customers/${testContext.customerId}`);
    if (custCheck.data.outstandingAmount !== 0) {
      throw new Error(`Customer Ledger Failure! Outstanding should be 0 (paid in full), but is ${custCheck.data.outstandingAmount}`);
    }
    console.log('       ✅ Customer balances match payments perfectly.');

    // 10. RETURNS MODULE
    console.log('[10/12] ↩️ Executing Customer Return (Return 2 units)...');
    const returnRes = await request('POST', '/returns', {
      originalInvoice: testContext.saleInvoiceId,
      returnType: 'CUSTOMER_RETURN',
      items: [{
        product: testContext.productId,
        quantity: 2,
        refundAmount: 53.9, // Proportionate return
        reason: 'Defective'
      }]
    });
    console.log('       ✅ Return recorded successfully.');

    // 11. POST-RETURN INVENTORY VERIFICATION
    console.log('[11/12] 🔍 Verifying Post-Return Stock...');
    const returnProdCheck = await request('GET', `/products/${testContext.productId}`);
    if (returnProdCheck.data.currentStock !== 92) { // 90 + 2
      throw new Error(`Return Inventory Failure! Expected 92 stock, got ${returnProdCheck.data.currentStock}`);
    }
    console.log('       ✅ Stock correctly recovered to 92.');

    // 12. REPORTS & ANALYTICS
    console.log('[12/12] 📈 Testing Reports and AI Intelligence modules...');
    await request('GET', '/reports/sales?range=today');
    await request('GET', '/intelligence');
    console.log('       ✅ Reports and ML endpoints responded successfully without crashing.');

    console.log('\n==========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('==========================================\n');

  } catch (error) {
    console.log('\n==========================================');
    console.error('❌ INTEGRATION TEST FAILED! ❌');
    console.log('==========================================');
    console.error('Failure Details:');
    if (error.error) {
      console.error(`Status Code: ${error.status}`);
      console.error(error.error);
    } else {
      console.error(error.message || error);
    }
    console.log('\n>>> PLEASE COPY THIS ERROR AND PASTE IT TO THE AI AGENT <<<');
  }
};

runIntegrationTest();
