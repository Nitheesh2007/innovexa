const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'dist');
const destDir = path.join(__dirname, 'dist');

console.log('Copying frontend/dist to dist...');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log('Successfully moved frontend build to root dist folder.');
} else {
  console.error('frontend/dist does not exist! Build might have failed.');
  process.exit(1);
}
