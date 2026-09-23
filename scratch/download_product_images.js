const fs = require('fs');
const path = require('path');
const https = require('https');

const productsToDownload = [
  {
    filename: 'dell_xps_15.jpg',
    url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'
  },
  {
    filename: 'apple_watch_series_9.jpg',
    url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
  },
  {
    filename: 'sony_wh_1000xm5.jpg',
    url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
  },
  {
    filename: 'rtx_4090.jpg',
    url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80'
  },
  {
    filename: 'ryzen_7950x3d.jpg',
    url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80'
  },
  {
    filename: 'airpods_pro.jpg',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80'
  },
  {
    filename: 'mx_master_3s.jpg',
    url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function run() {
  const publicDir = path.join(__dirname, '../frontend/public/images/products');
  const distDir = path.join(__dirname, '../frontend/dist/images/products');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  for (const item of productsToDownload) {
    const pubDest = path.join(publicDir, item.filename);
    const distDest = path.join(distDir, item.filename);
    console.log(`Downloading ${item.filename}...`);
    try {
      await download(item.url, pubDest);
      fs.copyFileSync(pubDest, distDest);
      console.log(`✅ Saved ${item.filename}`);
    } catch (e) {
      console.error(`❌ Error downloading ${item.filename}:`, e.message);
    }
  }
  console.log('🎉 All product images downloaded and saved locally!');
}

run();
