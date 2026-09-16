# StockFlow - Smart AI-Powered Inventory Management System

StockFlow is a production-ready, full-stack inventory management system featuring advanced real-time ML integration, intelligent fallbacks, and a beautifully unified UI.

## Getting Started (Single Command Setup)

StockFlow has been architected to run completely from a single command, automatically launching the frontend, the Node.js API, and managing the Python ML service orchestrations under one roof.

### 1. Requirements
- **Node.js**: v18+ 
- **Python** (Optional, for advanced ML): 3.9+ with `pip`

### 2. Configuration
Copy the `.env.example` templates to `.env` in the respective folders:
- `backend/.env` (Requires `JWT_SECRET=your_secret_key`)
- `frontend/.env` (Requires `VITE_API_URL=/api`)
- *Optional:* Configure `MONGODB_URI` inside `backend/.env` for cloud persistence. (If left blank or unavailable, StockFlow securely falls back to an isolated in-memory database).

### 3. Installation & Run
From the root directory, simply run:
```bash
npm install        # Install root orchestrator dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Build UI and Start the entire application suite
npm run build
npm run start
```

### Accessing the App
Open your browser and navigate to:
**http://localhost:8072**

Everything—from the React Frontend, OCR image uploads, AI Assistant generation, to the internal Python FastAPI integrations—will function entirely through this single localhost origin without CORS issues.

## Default Credentials
- **Email:** `admin@stockflow.com`
- **Password:** `Admin@123`
