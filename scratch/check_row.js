const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/LandingPage.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('row.') || l.includes('row[')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
