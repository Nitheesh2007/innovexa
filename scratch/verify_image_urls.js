const imgs = [
  'iphone_15_pro_max.jpg',
  'galaxy_s24_ultra.jpg',
  'macbook_pro_16.jpg',
  'dell_xps_15.jpg',
  'apple_watch_series_9.jpg',
  'sony_wh_1000xm5.jpg',
  'rtx_4090.jpg',
  'ryzen_7950x3d.jpg',
  'airpods_pro.jpg',
  'mx_master_3s.jpg'
];

async function verify() {
  console.log('Verifying all product image HTTP responses from http://localhost:5000...');
  for (const img of imgs) {
    const res = await fetch(`http://localhost:5000/images/products/${img}`);
    console.log(`[${res.status}] ${img} -> Content-Type: ${res.headers.get('content-type')}, Size: ${res.headers.get('content-length')} bytes`);
  }
}

verify().catch(console.error);
