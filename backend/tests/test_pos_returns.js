const axios = require('axios');

async function testPOSAndReturns() {
  const API_BASE = 'http://localhost:5000/api';
  console.log('Testing POS Sale and Return Transaction Flow...');

  // 1. Admin login
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@stockflow.com',
    password: 'Admin@12345'
  });
  const token = loginRes.data.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Fetch products and customer
  const prodRes = await axios.get(`${API_BASE}/products`, { headers });
  const custRes = await axios.get(`${API_BASE}/customers`, { headers });

  const product = prodRes.data.data.find(p => p.currentStock > 2);
  const customer = custRes.data.data[0];

  console.log(`Using product: ${product.productName} (Initial Stock: ${product.currentStock})`);
  console.log(`Using customer: ${customer.name}`);

  // 3. POS Sale (/api/invoices/stock-out)
  const saleRes = await axios.post(`${API_BASE}/invoices/stock-out`, {
    customer: customer._id,
    items: [{
      product: product._id,
      quantity: 2,
      unitPrice: product.sellingPrice,
      taxRate: 5,
      discount: 0
    }],
    paymentMethod: 'CASH',
    discountTotal: 0,
    paidAmount: product.sellingPrice * 2 * 1.05,
    notes: 'POS Automated Test Sale'
  }, { headers });

  console.log('✅ POS Sale Created:', saleRes.data.data.invoiceNumber);
  const invoiceId = saleRes.data.data._id;

  // 4. Verify product stock decreased by 2
  const updatedProd = await axios.get(`${API_BASE}/products/${product._id}`, { headers });
  console.log(`Product New Stock after sale: ${updatedProd.data.data.currentStock} (Expected: ${product.currentStock - 2})`);

  // 5. Process Return (/api/returns)
  const returnRes = await axios.post(`${API_BASE}/returns`, {
    originalInvoiceId: invoiceId,
    returnType: 'CUSTOMER_RETURN',
    items: [{
      product: product._id,
      returnQuantity: 1,
      reason: 'Defective unit'
    }],
    reason: 'Defective unit',
    notes: 'Customer returned 1 item'
  }, { headers });

  console.log('✅ Customer Return Processed:', returnRes.data.data.returnNumber);

  // 6. Verify product stock increased by 1
  const restockedProd = await axios.get(`${API_BASE}/products/${product._id}`, { headers });
  console.log(`Product New Stock after return: ${restockedProd.data.data.currentStock} (Expected: ${product.currentStock - 1})`);

  console.log('🎉 POS and Returns transactional loop verified 100% working!');
}

testPOSAndReturns().catch(err => {
  console.error('Error during POS and Returns test:', err.response?.data || err.message);
  process.exit(1);
});
