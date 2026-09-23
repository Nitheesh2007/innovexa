const fs = require('fs');
const path = require('path');
const content = fs.readFileSync('frontend/src/pages/LandingPage.jsx', 'utf8');

// Check for unclosed tags, undeclared variables, or syntax issues
console.log('LandingPage lines:', content.split('\n').length);

// Let's check imports vs usage
const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+'lucide-react'/);
if (importMatch) {
  const icons = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  console.log('Imported icons:', icons.length);
  // Check if any icon is missing or invalid in lucide-react
  const lucide = require(path.join(__dirname, '../frontend/node_modules/lucide-react'));
  const missing = icons.filter(name => !lucide[name]);
  console.log('MISSING ICONS IN LUCIDE-REACT:', missing);
}
