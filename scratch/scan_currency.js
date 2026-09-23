const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        scanDir(fullPath);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Find $ not followed by {
        const matches = line.match(/\$(?!\{)/g);
        if (matches) {
          if (!line.includes('/$') && !line.includes('$1') && !line.includes('$2') && !line.includes('$3') && !line.includes('$$')) {
            console.log(`${fullPath}:${idx + 1} -> ${line.trim()}`);
          }
        }
      });
    }
  }
}

console.log('--- FRONTEND ---');
scanDir(path.join(__dirname, '../frontend/src'));

