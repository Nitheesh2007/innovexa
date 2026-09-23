const fs = require('fs');
const path = require('path');

// Let's test build with Vite!
const { execSync } = require('child_process');
console.log('Building frontend to check for any build errors...');
try {
  execSync('npm run build', { cwd: path.join(__dirname, '../frontend'), stdio: 'inherit' });
  console.log('✅ Build succeeded without errors!');
} catch (e) {
  console.error('❌ Build failed:', e.message);
  process.exit(1);
}
