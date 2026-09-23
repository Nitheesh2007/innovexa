async function fetchProducts() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@stockflow.com', password: 'Admin@12345' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  const prodsRes = await fetch('http://localhost:5000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const prodsData = await prodsRes.json();
  console.log(`Found ${prodsData.data.length} products:`);
  prodsData.data.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p._id}] "${p.productName}"`);
    console.log(`   Image: ${p.productImage}`);
  });
}

fetchProducts().catch(console.error);
