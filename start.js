const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log("🚀 Starting StockFlow Single Localhost Ecosystem...");

// Check if Python is installed
let pythonCmd = 'python';
try {
  execSync('python --version', { stdio: 'ignore' });
} catch (e) {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    pythonCmd = 'python3';
  } catch (e2) {
    console.warn("⚠️ Python not found in PATH. The Python ML Service will NOT be started. Node.js fallback will be used.");
    pythonCmd = null;
  }
}

// Start Python Service
let pythonProcess = null;
if (pythonCmd) {
  console.log(`🐍 Starting Python FastAPI ML Service on port 8000 using ${pythonCmd}...`);
  const mlPath = path.join(__dirname, 'ml_service');
  
  pythonProcess = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000'], {
    cwd: mlPath,
    shell: true,
    stdio: 'pipe'
  });

  pythonProcess.stdout.on('data', (data) => console.log(`[ML] ${data}`));
  pythonProcess.stderr.on('data', (data) => console.error(`[ML ERROR] ${data}`));
}

// Build Frontend
console.log(`🔨 Building React Frontend (This may take a moment)...`);
const frontendPath = path.join(__dirname, 'frontend');
try {
  execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
  console.log(`✅ Frontend build complete.`);
} catch (e) {
  console.error(`❌ Frontend build failed:`, e.message);
}

// Start Node.js Express Backend
console.log(`🟢 Starting Node.js Express Backend (Serving React on port 5000)...`);
const backendPath = path.join(__dirname, 'backend');

if (!fs.existsSync(path.join(backendPath, 'node_modules'))) {
  try {
    console.log('📦 Ensuring backend dependencies are installed...');
    execSync('npm install', { cwd: backendPath, stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Failed to install backend dependencies', e.message);
  }
}

const backendProcess = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'pipe',
  env: { ...process.env, PORT: '5000' }
});

backendProcess.stdout.on('data', (data) => console.log(`[NODE] ${data}`));
backendProcess.stderr.on('data', (data) => console.error(`[NODE ERROR] ${data}`));

// Handle graceful shutdown
const cleanup = () => {
  console.log("\n🛑 Shutting down StockFlow services...");
  if (pythonProcess) pythonProcess.kill();
  if (backendProcess) backendProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
