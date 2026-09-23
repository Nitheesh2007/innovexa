const { execSync } = require('child_process');
try {
  const out = execSync('netstat -ano | findstr 5000', { encoding: 'utf8' });
  console.log('PORT 5000:');
  console.log(out);
} catch (e) {
  console.log('No process on 5000');
}
