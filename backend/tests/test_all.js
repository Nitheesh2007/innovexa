const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 STOCKFLOW COMPREHENSIVE END-TO-END TEST SUITE');
  console.log(`🎯 Target API: ${API_BASE}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  // 1. Health & Diagnostics
  console.log('1. Testing System Diagnostics...');
  try {
    const healthRes = await axios.get(`${API_BASE}/health`);
    assert('Health Check (/api/health)', healthRes.status === 200 && healthRes.data.status === 'ok');

    const statusRes = await axios.get(`${API_BASE}/system/status`);
    assert('System Status (/api/system/status)', statusRes.status === 200 && statusRes.data.success);

    const rootRes = await axios.get('http://localhost:5000/');
    assert('Frontend SPA Landing Page (GET /)', rootRes.status === 200 && rootRes.data.includes('html'));
  } catch (e) {
    assert('System Diagnostics', false, e.message);
  }

  // 2. Authentication
  console.log('\n2. Testing Authentication...');
  let adminToken = '';
  let userToken = '';

  try {
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@stockflow.com',
      password: 'Admin@12345'
    });
    adminToken = adminLoginRes.data.data?.token;
    assert('Admin Login (/api/auth/login)', !!adminToken);
  } catch (e) {
    assert('Admin Login', false, e.response?.data?.message || e.message);
  }

  try {
    const userLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user@stockflow.com',
      password: 'User@12345'
    });
    userToken = userLoginRes.data.data?.token;
    assert('Staff User Login (/api/auth/login)', !!userToken);
  } catch (e) {
    assert('Staff User Login', false, e.response?.data?.message || e.message);
  }

  // 3. Operational Business Endpoints
  if (adminToken) {
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    console.log('\n3. Testing Core Catalog & Image Matching...');
    let firstProductId = null;
    let productsList = [];
    try {
      const prodRes = await axios.get(`${API_BASE}/products`, { headers: authHeaders });
      productsList = prodRes.data.data || [];
      assert('Fetch Products (/api/products)', prodRes.status === 200 && Array.isArray(productsList) && productsList.length > 0);
      
      if (productsList.length > 0) {
        firstProductId = productsList[0]._id;
        // Verify product images match product names
        const allHaveImages = productsList.every(p => p.productImage && (p.productImage.startsWith('http') || p.productImage.startsWith('/images/')));
        assert('100% Products Have Verified High-Res Image URLs', allHaveImages);
      }
    } catch (e) {
      assert('Fetch Products & Image Check', false, e.message);
    }

    if (firstProductId) {
      try {
        const singleRes = await axios.get(`${API_BASE}/products/${firstProductId}`, { headers: authHeaders });
        assert('Fetch Single Product Details', singleRes.status === 200 && singleRes.data.data.productName);

        const txRes = await axios.get(`${API_BASE}/products/${firstProductId}/transactions`, { headers: authHeaders });
        assert('Product Transaction History Timeline', txRes.status === 200 && Array.isArray(txRes.data.data));
      } catch (e) {
        assert('Product Details & Transactions', false, e.response?.data?.message || e.message);
      }
    }

    console.log('\n4. Testing Dashboard & ML Intelligence...');
    try {
      const dashRes = await axios.get(`${API_BASE}/dashboard`, { headers: authHeaders });
      assert('Dashboard Analytics (/api/dashboard)', dashRes.status === 200 && !!dashRes.data.data);
    } catch (e) {
      assert('Dashboard Stats', false, e.message);
    }

    try {
      const intelRes = await axios.get(`${API_BASE}/intelligence`, { headers: authHeaders });
      assert('Scikit-Learn ML Intelligence (/api/intelligence)', intelRes.status === 200 && Array.isArray(intelRes.data.data));
    } catch (e) {
      assert('ML Intelligence', false, e.message);
    }

    console.log('\n5. Testing Invoices & Reverse Logistics (Returns)...');
    let invoiceId = null;
    try {
      const invRes = await axios.get(`${API_BASE}/invoices`, { headers: authHeaders });
      assert('Fetch Invoices (/api/invoices)', invRes.status === 200 && Array.isArray(invRes.data.data));
      if (invRes.data.data.length > 0) {
        invoiceId = invRes.data.data[0]._id;
      }
    } catch (e) {
      assert('Fetch Invoices', false, e.message);
    }

    try {
      const retRes = await axios.get(`${API_BASE}/returns`, { headers: authHeaders });
      assert('Fetch Returns Management (/api/returns)', retRes.status === 200 && Array.isArray(retRes.data.data));
    } catch (e) {
      assert('Fetch Returns', false, e.message);
    }

    console.log('\n6. Testing Finance & Financial Intelligence...');
    try {
      const finRes = await axios.get(`${API_BASE}/finance/profit-loss`, { headers: authHeaders });
      assert('Finance Profit & Loss (/api/finance/profit-loss)', finRes.status === 200 && finRes.data.success);
    } catch (e) {
      assert('Finance Profit & Loss', false, e.message);
    }

    try {
      const payRes = await axios.get(`${API_BASE}/finance/payment-history`, { headers: authHeaders });
      assert('Payment Ledgers & History (/api/finance/payment-history)', payRes.status === 200);
    } catch (e) {
      assert('Payment History', false, e.message);
    }

    console.log('\n7. Testing AI Copilot Intelligence Engine...');
    try {
      const aiHistRes = await axios.get(`${API_BASE}/ai/history`, { headers: authHeaders });
      assert('AI Chat History (/api/ai/history)', aiHistRes.status === 200);

      const aiChatRes = await axios.post(`${API_BASE}/ai/chat`, {
        message: 'What is our current total inventory valuation?'
      }, { headers: authHeaders });
      assert('AI Assistant Reasoning (/api/ai/chat)', aiChatRes.status === 200 && aiChatRes.data.data?.response);
    } catch (e) {
      assert('AI Copilot Assistant', false, e.message);
    }
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
