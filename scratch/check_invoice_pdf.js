async function test() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@stockflow.com', password: 'Admin@12345' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  let invsRes = await fetch('http://localhost:5000/api/invoices', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  let invsData = await invsRes.json();
  let invoices = invsData.data || [];
  console.log(`Found ${invoices.length} invoices.`);

  // If no invoices exist, create a demo sales invoice to test!
  if (invoices.length === 0) {
    console.log('Creating demo tax invoice matching user specifications...');
    const prodsRes = await fetch('http://localhost:5000/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const prodsData = await prodsRes.json();
    const products = prodsData.data || [];

    const custsRes = await fetch('http://localhost:5000/api/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const custsData = await custsRes.json();
    const customer = (custsData.data && custsData.data[0]) || null;

    const demoItems = products.slice(0, 3).map((p, idx) => ({
      product: p._id,
      productName: p.productName,
      quantity: 1,
      unitPrice: p.sellingPrice,
      discount: 0,
      taxRate: 0
    }));

    const createRes = await fetch('http://localhost:5000/api/invoices/stock-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customer: customer ? customer._id : undefined,
        partyName: 'raman',
        items: demoItems,
        paymentMethod: 'CASH',
        paidAmount: demoItems.reduce((acc, i) => acc + i.unitPrice, 0)
      })
    });
    const createData = await createRes.json();
    console.log('Created invoice response:', createData.success, createData.data?.invoiceNumber);
    if (createData.data) invoices = [createData.data];
  }

  if (invoices.length > 0) {
    const inv = invoices[0];
    console.log(`Testing PDF generation for invoice ${inv.invoiceNumber} (${inv._id})...`);
    const pdfRes = await fetch(`http://localhost:5000/api/invoices/${inv._id}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`PDF HTTP Status: ${pdfRes.status}, Content-Type: ${pdfRes.headers.get('content-type')}`);
    if (pdfRes.status === 200) {
      console.log('✅ PDF Generation Verified!');
    }
  }
}

test().catch(console.error);
