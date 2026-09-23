const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/POS.jsx', 'utf8');
const lines = content.split('\n');
let dollarMatches = [];
lines.forEach((l, i) => {
  const m = l.match(/\$(?!\{)/g);
  if (m) {
    dollarMatches.push(`Line ${i + 1}: ${l.trim()}`);
  }
});
console.log('Dollar matches in POS.jsx:', dollarMatches.length);
dollarMatches.forEach(m => console.log(m));
