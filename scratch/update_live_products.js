const realImageMap = {
  'IP15PM-256-BLK': '/images/products/iphone_15_pro_max.jpg',
  'SGS24U-512-TI': '/images/products/galaxy_s24_ultra.jpg',
  'MBP16-M3M-1TB': '/images/products/macbook_pro_16.jpg',
  'DXPS15-I9-1TB': '/images/products/dell_xps_15.jpg',
  'AWS9-45-MID': '/images/products/apple_watch_series_9.jpg',
  'SONY-WHXM5-BLK': '/images/products/sony_wh_1000xm5.jpg',
  'NV-RTX4090-FE': '/images/products/rtx_4090.jpg',
  'AMD-R9-7950X3D': '/images/products/ryzen_7950x3d.jpg',
  'AP-PRO-2G': '/images/products/airpods_pro.jpg',
  'LOGI-MX3S': '/images/products/mx_master_3s.jpg'
};

async function updateLiveProducts() {
  console.log('🔄 Logging in as Admin...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@stockflow.com', password: 'Admin@12345' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  console.log('📦 Fetching current products...');
  const prodsRes = await fetch('http://localhost:5000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const prodsData = await prodsRes.json();
  const products = prodsData.data;

  console.log(`Found ${products.length} products to update.`);

  for (const p of products) {
    const newImage = realImageMap[p.sku] || 
      (p.productName.toLowerCase().includes('iphone') ? '/images/products/iphone_15_pro_max.jpg' :
       p.productName.toLowerCase().includes('samsung') ? '/images/products/galaxy_s24_ultra.jpg' :
       p.productName.toLowerCase().includes('macbook') ? '/images/products/macbook_pro_16.jpg' :
       p.productName.toLowerCase().includes('dell') ? '/images/products/dell_xps_15.jpg' :
       p.productName.toLowerCase().includes('watch') ? '/images/products/apple_watch_series_9.jpg' :
       p.productName.toLowerCase().includes('sony') ? '/images/products/sony_wh_1000xm5.jpg' :
       p.productName.toLowerCase().includes('rtx') ? '/images/products/rtx_4090.jpg' :
       p.productName.toLowerCase().includes('ryzen') ? '/images/products/ryzen_7950x3d.jpg' :
       p.productName.toLowerCase().includes('airpods') ? '/images/products/airpods_pro.jpg' :
       p.productName.toLowerCase().includes('logitech') ? '/images/products/mx_master_3s.jpg' : p.productImage);

    console.log(`Updating "${p.productName}" -> ${newImage}`);
    const updateRes = await fetch(`http://localhost:5000/api/products/${p._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productImage: newImage })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) {
      console.error(`Failed to update ${p.productName}:`, updateData.message);
    }
  }

  console.log('✨ All live products updated with authentic product images!');
}

updateLiveProducts().catch(console.error);
